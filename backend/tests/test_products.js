import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import User from '../src/modules/users/user.model.js';
import Category from '../src/modules/categories/category.model.js';
import Product from '../src/modules/products/product.model.js';
import env from '../src/config/env.js';

const testAdminEmail = 'test_admin_prod@agriport.in';
const testAdminMobile = '9999922222';
const testAdminPassword = 'SecureAdminPassword123';

const runTest = async () => {
  console.log('🔄 Connecting to MongoDB to set up test data...');
  await mongoose.connect(env.MONGO_URI);

  // Clean up any stale data from previous test runs
  await User.deleteOne({ email: testAdminEmail });
  await User.deleteOne({ mobile: testAdminMobile });
  await Product.deleteMany({ sku: 'WHEAT-PUNJAB-001' });
  await Category.deleteOne({ name: 'Test Wheat Category' });

  console.log('✅ Cleaned up old test records.');

  // 1. Create a test admin user directly in DB
  console.log('\n1️⃣ Creating Admin user in DB...');
  const adminUser = await User.create({
    name: 'Test Admin User',
    email: testAdminEmail,
    mobile: testAdminMobile,
    password: testAdminPassword,
    role: 'admin',
    status: 'active',
  });
  console.log('✅ Admin user created with ID:', adminUser._id);

  // Disconnect so we don't hold the DB connection open during network requests
  await mongoose.disconnect();

  // 2. Log in to get the JWT Access Token
  console.log('\n2️⃣ Logging in to obtain Access Token...');
  const loginRes = await fetch('http://localhost:5000/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      loginId: testAdminEmail,
      password: testAdminPassword,
    }),
  });
  const loginData = await loginRes.json();
  if (!loginRes.ok) {
    throw new Error(`Login failed: ${loginData.message}`);
  }
  const accessToken = loginData.data.accessToken;
  console.log('🔑 Received Access Token:', accessToken.substring(0, 20) + '...');

  // 3. Create a Category
  console.log('\n3️⃣ Creating category...');
  const categoryRes = await fetch('http://localhost:5000/api/v1/categories', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      name: 'Test Wheat Category',
      image: 'http://example.com/cat.jpg',
      order: 5,
    }),
  });
  const categoryData = await categoryRes.json();
  if (!categoryRes.ok) {
    throw new Error(`Category creation failed: ${categoryData.message}`);
  }
  const category = categoryData.data;
  console.log('✅ Category created:', category);
  if (category.slug !== 'test-wheat-category') {
    throw new Error(`Slug generation incorrect: ${category.slug}`);
  }
  const categoryId = category._id;

  // 4. Create a Product via FormData (simulates file upload)
  console.log('\n4️⃣ Creating Product with lot pricing slabs and uploaded images...');
  const formData = new FormData();
  formData.append('name', 'Organic Punjab Wheat');
  formData.append('description', 'High grade organic wheat directly from the farms of Punjab.');
  formData.append('sku', 'WHEAT-PUNJAB-001');
  formData.append('category', categoryId);
  formData.append('unit', 'kg');
  formData.append('moq', '100');
  formData.append('stock', '50');
  formData.append('priceSlabs', JSON.stringify([
    { minQty: 100, unitPrice: 32.5 },
    { minQty: 500, unitPrice: 30.0 }
  ]));
  formData.append('specs', JSON.stringify({ Grade: 'A+', Origin: 'Punjab', Moisture: '12%' }));
  formData.append('variants', JSON.stringify(['50kg bag', '100kg bag']));

  // Add mock images
  const imageBlob1 = new Blob(['mock image data 1'], { type: 'image/png' });
  const imageBlob2 = new Blob(['mock image data 2'], { type: 'image/jpeg' });
  formData.append('images', imageBlob1, 'wheat1.png');
  formData.append('images', imageBlob2, 'wheat2.jpg');

  const productRes = await fetch('http://localhost:5000/api/v1/products', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
    body: formData, // boundary is auto-set by fetch
  });
  const productData = await productRes.json();
  if (!productRes.ok) {
    throw new Error(`Product creation failed: ${productData.message}`);
  }
  const product = productData.data;
  console.log('✅ Product created successfully:');
  console.log('- Name:', product.name);
  console.log('- SKU:', product.sku);
  console.log('- Initial Status:', product.status);
  console.log('- Saved images path fallback:', product.images);

  if (product.status !== 'in_stock') {
    throw new Error(`Expected status "in_stock", got "${product.status}"`);
  }
  if (product.images.length !== 2) {
    throw new Error(`Expected 2 images, got ${product.images.length}`);
  }
  const productId = product._id;

  // 5. Query Products Endpoint with different filters
  console.log('\n5️⃣ Testing product retrieval & query filtering...');

  // Search filter
  const searchRes = await fetch('http://localhost:5000/api/v1/products?search=Organic');
  const searchData = await searchRes.json();
  console.log('🔍 Search query "?search=Organic" returned count:', searchData.data.products.length);
  if (searchData.data.products.length === 0) {
    throw new Error('Search query did not return the created product.');
  }

  // Category filter
  const catFilterRes = await fetch(`http://localhost:5000/api/v1/products?category=${categoryId}`);
  const catFilterData = await catFilterRes.json();
  console.log('🔍 Category filter query returned count:', catFilterData.data.products.length);
  if (catFilterData.data.products.length === 0) {
    throw new Error('Category filter did not return the created product.');
  }

  // Price range filter
  const priceFilterRes = await fetch('http://localhost:5000/api/v1/products?minPrice=31&maxPrice=34');
  const priceFilterData = await priceFilterRes.json();
  console.log('🔍 Price range "?minPrice=31&maxPrice=34" returned count:', priceFilterData.data.products.length);
  if (priceFilterData.data.products.length === 0) {
    throw new Error('Price range filter did not return the created product.');
  }

  // 6. Update product stock to verify low_stock status trigger
  console.log('\n6️⃣ Testing status calculation (updating stock to 5 for "low_stock")...');
  const updateLowStockRes = await fetch(`http://localhost:5000/api/v1/products/${productId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ stock: 5 }),
  });
  const updateLowStockData = await updateLowStockRes.json();
  console.log('Response status:', updateLowStockData.data.status);
  if (updateLowStockData.data.status !== 'low_stock') {
    throw new Error(`Expected status "low_stock", got "${updateLowStockData.data.status}"`);
  }

  // 7. Update product stock to verify out_of_stock status trigger
  console.log('\n7️⃣ Testing status calculation (updating stock to 0 for "out_of_stock")...');
  const updateOutStockRes = await fetch(`http://localhost:5000/api/v1/products/${productId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ stock: 0 }),
  });
  const updateOutStockData = await updateOutStockRes.json();
  console.log('Response status:', updateOutStockData.data.status);
  if (updateOutStockData.data.status !== 'out_of_stock') {
    throw new Error(`Expected status "out_of_stock", got "${updateOutStockData.data.status}"`);
  }

  // 8. Verify category deletion is blocked when there is an active product
  console.log('\n8️⃣ Verifying Category deletion blocks when product is active...');
  const deleteCategoryBlockedRes = await fetch(`http://localhost:5000/api/v1/categories/${categoryId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });
  const deleteCategoryBlockedData = await deleteCategoryBlockedRes.json();
  console.log('Response:', deleteCategoryBlockedData);
  if (deleteCategoryBlockedRes.ok) {
    throw new Error('Expected category deletion to fail but it succeeded.');
  }

  // 9. Soft-delete the product
  console.log('\n9️⃣ Soft-deleting the product...');
  const deleteProductRes = await fetch(`http://localhost:5000/api/v1/products/${productId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });
  const deleteProductData = await deleteProductRes.json();
  if (!deleteProductRes.ok) {
    throw new Error(`Product soft-delete failed: ${deleteProductData.message}`);
  }
  console.log('Response:', deleteProductData);

  // Verify that the archived product is excluded from listings
  const queryArchivedRes = await fetch(`http://localhost:5000/api/v1/products?category=${categoryId}`);
  const queryArchivedData = await queryArchivedRes.json();
  console.log('🔍 Listing products after archive returned count:', queryArchivedData.data.products.length);
  if (queryArchivedData.data.products.length !== 0) {
    throw new Error('Archived product was returned in product listing!');
  }

  // 10. Delete the category now that the product is archived
  console.log('\n🔟 Deleting category after product is archived...');
  const deleteCategoryRes = await fetch(`http://localhost:5000/api/v1/categories/${categoryId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });
  const deleteCategoryData = await deleteCategoryRes.json();
  if (!deleteCategoryRes.ok) {
    throw new Error(`Category deletion failed: ${deleteCategoryData.message}`);
  }
  console.log('Response:', deleteCategoryData);

  // 11. Cleanup test database records and local images from disk
  console.log('\n🧹 Cleaning up test database records and disk uploads...');
  await mongoose.connect(env.MONGO_URI);
  await User.deleteOne({ email: testAdminEmail });
  await User.deleteOne({ mobile: testAdminMobile });
  await Product.deleteOne({ _id: productId });
  await Category.deleteOne({ _id: categoryId });

  // Delete local uploaded test files if they exist
  product.images.forEach((imgUrl) => {
    if (imgUrl.startsWith('/uploads/')) {
      const filePath = path.join(process.cwd(), imgUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`Unlinked local upload: ${filePath}`);
      }
    }
  });

  await mongoose.disconnect();
  console.log('\n🎉 ALL PRODUCTS & CATEGORIES MODULE TESTS PASSED SUCCESSFULLY!');
};

runTest().catch(async (err) => {
  console.error('❌ Test failed with error:', err);
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  process.exit(1);
});
