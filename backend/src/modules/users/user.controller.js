import User from './user.model.js';
import Order from '../orders/order.model.js';
import SaleRecord from '../sales/saleRecord.model.js';
import SystemSetting from '../sales/systemSetting.model.js';
import { paginate } from '../../utils/paginate.js';
import asyncWrapper from '../../utils/asyncWrapper.js';
import AppError from '../../utils/AppError.js';
import { successResponse } from '../../utils/apiResponse.js';
import eventBus from '../../events/index.js';

// 1. Get all users (Admin only)
export const getAdminUsers = asyncWrapper(async (req, res) => {
  const { status, role, search } = req.query;

  const queryObj = {};

  if (status) queryObj.status = status;
  if (role) queryObj.role = role;

  if (search) {
    queryObj.$or = [
      { name: new RegExp(search, 'i') },
      { email: new RegExp(search, 'i') },
      { mobile: new RegExp(search, 'i') },
      { companyName: new RegExp(search, 'i') },
    ];
  }

  const result = await paginate(User, queryObj, req.query, {
    sort: { createdAt: -1 }
  });

  const userIds = result.docs.map(u => u._id);
  const orderStats = await Order.aggregate([
    { $match: { customerId: { $in: userIds } } },
    {
      $group: {
        _id: '$customerId',
        ordersCount: { $sum: 1 },
        totalSpend: { $sum: '$total' },
      }
    }
  ]);

  const statsMap = {};
  orderStats.forEach(stat => {
    statsMap[stat._id.toString()] = {
      ordersCount: stat.ordersCount,
      totalSpend: stat.totalSpend,
    };
  });

  const usersWithStats = result.docs.map(user => {
    const userObj = user.toObject ? user.toObject() : { ...user };
    const stats = statsMap[user._id.toString()] || { ordersCount: 0, totalSpend: 0 };
    userObj.ordersCount = stats.ordersCount;
    userObj.totalSpend = stats.totalSpend;
    return userObj;
  });

  return successResponse(
    res,
    {
      users: usersWithStats,
      pagination: result.pagination,
    },
    200,
    'Users retrieved successfully.'
  );
});

// 2. Update user status (Admin only)
export const updateUserStatus = asyncWrapper(async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status || !['active', 'suspended', 'blocked', 'pending'].includes(status)) {
    return next(new AppError('Invalid status value.', 400));
  }

  const user = await User.findById(id);
  if (!user) {
    return next(new AppError('User not found.', 404));
  }

  user.status = status;
  await user.save();

  return successResponse(res, user, 200, `User status updated to "${status}" successfully.`);
});

// 3. Verify customer/executive KYC (Admin only)
export const verifyUserKyc = asyncWrapper(async (req, res, next) => {
  const { id } = req.params;
  const { kycVerified } = req.body;

  const user = await User.findById(id);
  if (!user) {
    return next(new AppError('User not found.', 404));
  }

  user.kycVerified = kycVerified === true || kycVerified === 'true';
  
  // Auto-activate executive account once KYC document is verified
  if (user.kycVerified && user.status === 'pending' && user.role === 'executive') {
    user.status = 'active';
  }

  await user.save();
  return successResponse(res, user, 200, 'User KYC verification status updated successfully.');
});

// 4. Get all sales managers (Admin only)
export const getManagers = asyncWrapper(async (req, res) => {
  const managers = await User.find({ role: 'manager' }).sort({ createdAt: -1 });

  const managersWithStats = await Promise.all(
    managers.map(async (manager) => {
      const managerObj = manager.toObject ? manager.toObject() : { ...manager };
      
      // Count active executives in manager's team
      const teamSize = await User.countDocuments({
        managerId: manager._id,
        role: 'executive',
        status: 'active',
      });

      // Sum revenue from paid sale records for this manager
      const salesVolumeResult = await SaleRecord.aggregate([
        {
          $match: {
            managerId: manager._id,
            paymentStatus: 'paid',
          },
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$amount' },
          },
        },
      ]);
      
      const revenue = salesVolumeResult[0]?.totalRevenue || 0;

      managerObj.teamSize = teamSize;
      managerObj.revenue = revenue;
      return managerObj;
    })
  );

  return successResponse(res, managersWithStats, 200, 'Managers retrieved successfully.');
});

// 5. Create a new manager (Admin only)
export const createManager = asyncWrapper(async (req, res, next) => {
  const { name, email, mobile, password, region, target } = req.body;

  const exists = await User.findOne({ $or: [{ email }, { mobile }] });
  if (exists) {
    return next(new AppError('Manager with this email or mobile number already exists.', 409));
  }

  const manager = await User.create({
    name,
    email,
    mobile,
    password,
    role: 'manager',
    status: 'active',
    region,
    target: Number(target) || 0,
  });

  return successResponse(res, manager, 201, 'Sales Manager created successfully.');
});

// 6. Get pending executive approvals (Admin only)
export const getExecutiveApprovals = asyncWrapper(async (req, res) => {
  const pendingExecutives = await User.find({
    role: 'executive',
    status: 'pending',
  }).sort({ createdAt: -1 });

  return successResponse(res, pendingExecutives, 200, 'Pending executives retrieved successfully.');
});

// 7. Approve or reject executive onboarding (Admin only)
export const approveExecutive = asyncWrapper(async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['active', 'blocked'].includes(status)) {
    return next(new AppError('Approval status must be either "active" or "blocked".', 400));
  }

  const executive = await User.findOne({ _id: id, role: 'executive' });
  if (!executive) {
    return next(new AppError('Executive not found.', 404));
  }

  executive.status = status;
  if (status === 'active') {
    executive.kycVerified = true;
  }
  
  await executive.save();

  if (status === 'active') {
    eventBus.emit('executive.approved', executive);
  }

  return successResponse(res, executive, 200, `Executive account ${status === 'active' ? 'approved' : 'rejected'} successfully.`);
});

// Helper to serialize user matching frontend User interface
import BusinessDocument from './businessDocument.model.js';

export const serializeUser = (user) => {
  if (!user) return null;
  const userObj = user.toObject ? user.toObject() : { ...user };
  userObj.fullName = userObj.name || '';
  userObj.id = userObj._id ? userObj._id.toString() : '';
  return userObj;
};

// 8. Get current authenticated user profile (Customer/Staff)
export const getProfile = asyncWrapper(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    return next(new AppError('User profile not found.', 404));
  }
  return successResponse(res, serializeUser(user), 200, 'Profile retrieved successfully.');
});

// 9. Update current authenticated user profile
export const updateProfile = asyncWrapper(async (req, res, next) => {
  const { fullName, name, companyName, businessType, address, city, state, country, gstNumber } = req.body;

  const user = await User.findById(req.user._id);
  if (!user) {
    return next(new AppError('User not found.', 404));
  }

  const newName = fullName || name;
  if (newName) user.name = newName;
  if (companyName) user.companyName = companyName;
  if (businessType) user.businessType = businessType;
  if (address) user.address = address;
  if (city) user.city = city;
  if (state) user.state = state;
  if (country) user.country = country;
  if (gstNumber) user.gstNumber = gstNumber;

  await user.save();

  return successResponse(res, serializeUser(user), 200, 'Profile updated successfully.');
});

// 10. Get customer business documents
export const getDocuments = asyncWrapper(async (req, res) => {
  const documents = await BusinessDocument.find({ userId: req.user._id });
  
  // Format for frontend
  const formattedDocs = documents.map(d => ({
    id: d._id.toString(),
    type: d.type,
    name: d.name,
    fileName: d.fileName || '',
    fileUrl: d.fileUrl,
    status: d.status,
    uploadedOn: d.createdAt,
  }));

  // Ensure default list is returned with placeholders if documents are missing
  const defaultTypes = [
    { type: 'gst_certificate', name: 'GST Certificate' },
    { type: 'business_license', name: 'Business License' },
    { type: 'id_proof', name: 'ID Proof (PAN/Aadhaar)' },
    { type: 'address_proof', name: 'Address Proof' },
  ];

  const finalDocs = defaultTypes.map(def => {
    const existing = formattedDocs.find(fd => fd.type === def.type);
    if (existing) return existing;
    return {
      id: `missing-${def.type}`,
      type: def.type,
      name: def.name,
      fileName: '',
      fileUrl: '',
      status: 'missing',
      uploadedOn: null,
    };
  });

  return successResponse(res, finalDocs, 200, 'Documents retrieved successfully.');
});

// 11. Upload customer business document
export const uploadDocument = asyncWrapper(async (req, res, next) => {
  const { type } = req.body;
  if (!type) {
    return next(new AppError('Document type is required.', 400));
  }

  // Retrieve uploaded file details from multer upload middleware
  const fileKey = Object.keys(req.uploadedFiles || {})[0];
  const filesList = req.uploadedFiles?.[fileKey];
  const file = filesList && filesList.length > 0 ? filesList[0] : null;

  if (!file) {
    return next(new AppError('No document file was uploaded.', 400));
  }

  const docNames = {
    gst_certificate: 'GST Certificate',
    business_license: 'Business License',
    id_proof: 'ID Proof (PAN/Aadhaar)',
    address_proof: 'Address Proof',
  };

  const documentName = docNames[type] || 'Business Document';

  // Upsert the document
  const document = await BusinessDocument.findOneAndUpdate(
    { userId: req.user._id, type },
    {
      name: documentName,
      fileUrl: file, // URL or filename from handleUploads middleware
      fileName: file.split('/').pop() || 'document.pdf',
      status: 'pending',
      rejectionReason: '',
      verifiedBy: null,
      verifiedAt: null,
    },
    { upsert: true, new: true, runValidators: true }
  );

  const responseDoc = {
    id: document._id.toString(),
    type: document.type,
    name: document.name,
    fileName: document.fileName,
    fileUrl: document.fileUrl,
    status: document.status,
    uploadedOn: document.createdAt,
  };

  return successResponse(res, responseDoc, 201, 'Document uploaded successfully.');
});

// 12. Get documents for a specific user (Admin only)
export const getAdminUserDocuments = asyncWrapper(async (req, res, next) => {
  const { id } = req.params;
  const documents = await BusinessDocument.find({ userId: id });
  
  // Format for frontend
  const formattedDocs = documents.map(d => ({
    id: d._id.toString(),
    type: d.type,
    name: d.name,
    fileName: d.fileName || '',
    fileUrl: d.fileUrl,
    status: d.status,
    uploadedOn: d.createdAt,
  }));

  // Ensure default list is returned with placeholders if documents are missing
  const defaultTypes = [
    { type: 'gst_certificate', name: 'GST Certificate' },
    { type: 'business_license', name: 'Business License' },
    { type: 'id_proof', name: 'ID Proof (PAN/Aadhaar)' },
    { type: 'address_proof', name: 'Address Proof' },
  ];

  const finalDocs = defaultTypes.map(def => {
    const existing = formattedDocs.find(fd => fd.type === def.type);
    if (existing) return existing;
    return {
      id: `missing-${def.type}`,
      type: def.type,
      name: def.name,
      fileName: '',
      fileUrl: '',
      status: 'missing',
      uploadedOn: null,
    };
  });

  return successResponse(res, finalDocs, 200, 'Customer documents retrieved successfully.');
});

// 13. Get Sales Settings (commission and override rate) (Admin only)
export const getSalesSettings = asyncWrapper(async (req, res) => {
  let commissionSetting = await SystemSetting.findOne({ key: 'sales_commission' });
  let overrideSetting = await SystemSetting.findOne({ key: 'manager_override' });

  if (!commissionSetting) {
    commissionSetting = await SystemSetting.create({ key: 'sales_commission', value: 5 });
  }
  if (!overrideSetting) {
    overrideSetting = await SystemSetting.create({ key: 'manager_override', value: 2 });
  }

  return successResponse(res, {
    commission: commissionSetting.value,
    override: overrideSetting.value,
  }, 200, 'Sales settings retrieved successfully.');
});

// 14. Update Sales Settings (Admin only)
export const updateSalesSettings = asyncWrapper(async (req, res, next) => {
  const { commission, override } = req.body;

  if (commission !== undefined) {
    if (typeof commission !== 'number' || commission < 0 || commission > 100) {
      return next(new AppError('Commission rate must be a number between 0 and 100.', 400));
    }
    await SystemSetting.findOneAndUpdate(
      { key: 'sales_commission' },
      { value: commission },
      { upsert: true, new: true }
    );
  }

  if (override !== undefined) {
    if (typeof override !== 'number' || override < 0 || override > 100) {
      return next(new AppError('Override rate must be a number between 0 and 100.', 400));
    }
    await SystemSetting.findOneAndUpdate(
      { key: 'manager_override' },
      { value: override },
      { upsert: true, new: true }
    );
  }

  return successResponse(res, {
    commission,
    override,
  }, 200, 'Sales settings updated successfully.');
});

