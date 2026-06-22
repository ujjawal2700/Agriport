import { createApi } from '@reduxjs/toolkit/query/react'
import { apiClient } from './apiClient'
import type {
  Product,
  Category,
  Order,
  Transaction,
  BusinessDocument,
  Banner,
  AdminUser,
  ManagerRow,
  ExecutiveApproval,
  StockRequest,
  DashboardStats,
  SalesPoint,
  CategorySales,
  Executive,
  CRMCustomer,
  FollowUp,
  SaleRecord,
  VendorPurchase,
  IncentivePoint,
  SalesStats,
} from '@/types'


export interface ProductQuery {
  search?: string
  category?: string
  sort?: 'relevance' | 'price_asc' | 'price_desc' | 'rating'
  inStockOnly?: boolean
}

const axiosBaseQuery = () => async ({ url, method, data, params, headers }: any) => {
  try {
    const result = await apiClient({ url, method, data, params, headers });
    return { data: result.data };
  } catch (axiosError: any) {
    return {
      error: {
        status: axiosError.response?.status,
        data: axiosError.response?.data || axiosError.message,
      },
    };
  }
};

const mapProductResponse = (p: any): Product => {
  const pricingSlabs = (p.priceSlabs || []).map((slab: any, idx: number, arr: any[]) => {
    const nextSlab = arr[idx + 1];
    return {
      minQty: slab.minQty,
      maxQty: nextSlab ? nextSlab.minQty - 1 : null,
      price: slab.unitPrice,
      label: nextSlab ? `${slab.minQty}-${nextSlab.minQty - 1} ${p.unit}` : `${slab.minQty}+ ${p.unit}`,
    };
  });

  const basePrice = pricingSlabs[0]?.price || 0;

  const backendBase = (import.meta.env.VITE_API_URL as string)?.replace('/api/v1', '') || 'http://localhost:5000';
  const images = (p.images || []).map((img: string) => {
    if (img.startsWith('/uploads/')) {
      return `${backendBase}${img}`;
    }
    return img;
  });

  const specifications: Record<string, string> = {};
  if (p.specs) {
    Object.keys(p.specs).forEach((key) => {
      specifications[key] = p.specs[key];
    });
  }

  return {
    id: p._id,
    name: p.name,
    category: p.category?.name || p.category?.toString() || 'General',
    images: images.length > 0 ? images : ['https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&auto=format&fit=crop'],
    shortDescription: p.description?.substring(0, 100) + '...',
    description: p.description,
    specifications,
    unit: p.unit || 'kg',
    moq: p.moq || 1,
    availableStock: p.stock || 0,
    stockStatus: p.status || 'out_of_stock',
    basePrice,
    currency: 'INR',
    pricingSlabs,
    rating: 4.5,
    origin: specifications['Origin'] || 'India',
    leadTimeDays: 3,
  };
};

export const api = createApi({
  reducerPath: 'api',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['Product', 'Category', 'Order', 'Document', 'AdminUser', 'StockRequest', 'Executive'],
  endpoints: (build) => ({
    getProducts: build.query<Product[], ProductQuery | void>({
      query: (arg) => {
        const q = arg || {};
        return {
          url: '/products',
          method: 'GET',
          params: {
            search: q.search,
            category: q.category === 'all' ? undefined : q.category,
            inStockOnly: q.inStockOnly ? 'true' : undefined,
            sort: q.sort === 'rating' ? 'relevance' : q.sort,
          },
        };
      },
      transformResponse: (response: any) => {
        return (response.data.products || []).map(mapProductResponse);
      },
      providesTags: ['Product'],
    }),
    getProduct: build.query<Product | undefined, string>({
      query: (id) => ({
        url: `/products/${id}`,
        method: 'GET',
      }),
      transformResponse: (response: any) => {
        return response.data ? mapProductResponse(response.data) : undefined;
      },
      providesTags: ['Product'],
    }),
    getCategories: build.query<Category[], void>({
      query: () => ({
        url: '/categories',
        method: 'GET',
      }),
      transformResponse: (response: any) => {
        return (response.data || []).map((cat: any) => ({
          id: cat._id,
          name: cat.name,
          slug: cat.slug,
          productCount: 0,
          icon: cat.image,
        }));
      },
      providesTags: ['Category'],
    }),
    getBanners: build.query<Banner[], void>({
      query: () => ({
        url: '/storefront',
        method: 'GET',
      }),
      transformResponse: (response: any) => response.data?.banners || [],
    }),
    getOrders: build.query<Order[], void>({
      query: () => ({
        url: '/orders',
        method: 'GET',
      }),
      transformResponse: (response: any) => {
        const orders = response.data?.orders || [];
        return orders.map((o: any) => ({
          id: o._id,
          reference: o.reference,
          placedOn: o.createdAt,
          status: o.status,
          paymentStatus: o.paymentStatus,
          paymentMode: o.paymentMode,
          lines: (o.lines || []).map((line: any) => ({
            productId: line.productId,
            name: line.name,
            image: line.image,
            quantity: line.quantity,
            unit: line.unit,
            unitPrice: line.unitPrice,
            lineTotal: line.lineTotal,
            specifications: line.specifications || {},
          })),
          subtotal: o.subtotal,
          tax: o.tax,
          shipping: o.shipping,
          total: o.total,
          pickupAddress: o.pickupAddress,
          deliveryAddress: o.deliveryAddress,
          invoiceNo: o.invoiceNo,
          gatePassNo: o.gatePassNo,
          trackingTimeline: o.trackingTimeline || [],
        }));
      },
      providesTags: ['Order'],
    }),
    getOrder: build.query<Order | undefined, string>({
      query: (id) => ({
        url: `/orders/${id}`,
        method: 'GET',
      }),
      transformResponse: (response: any) => {
        const o = response.data;
        if (!o) return undefined;
        return {
          id: o._id,
          reference: o.reference,
          placedOn: o.createdAt,
          status: o.status,
          paymentStatus: o.paymentStatus,
          paymentMode: o.paymentMode,
          lines: (o.lines || []).map((line: any) => ({
            productId: line.productId,
            name: line.name,
            image: line.image,
            quantity: line.quantity,
            unit: line.unit,
            unitPrice: line.unitPrice,
            lineTotal: line.lineTotal,
            specifications: line.specifications || {},
          })),
          subtotal: o.subtotal,
          tax: o.tax,
          shipping: o.shipping,
          total: o.total,
          pickupAddress: o.pickupAddress,
          deliveryAddress: o.deliveryAddress,
          invoiceNo: o.invoiceNo,
          gatePassNo: o.gatePassNo,
          trackingTimeline: o.trackingTimeline || [],
        };
      },
      providesTags: ['Order'],
    }),
    getTransactions: build.query<Transaction[], void>({
      query: () => ({
        url: '/payments/transactions',
        method: 'GET',
      }),
      transformResponse: (response: any) => {
        const txs = response.data?.transactions || [];
        return txs.map((t: any) => ({
          id: t._id,
          orderRef: t.orderRef,
          amount: t.amount,
          mode: t.mode,
          date: t.createdAt,
          status: t.status,
        }));
      },
    }),
    getDocuments: build.query<BusinessDocument[], void>({
      query: () => ({
        url: '/users/me/documents',
        method: 'GET',
      }),
      transformResponse: (response: any) => {
        const docs = response.data || [];
        return docs.map((d: any) => ({
          id: d.id,
          type: d.type,
          name: d.name,
          fileName: d.fileName || '',
          fileUrl: d.fileUrl || '',
          status: d.status,
          uploadedOn: d.uploadedOn,
        }));
      },
      providesTags: ['Document'],
    }),

    // ── Admin ────────────────────────────────────────────────────────────────
    getDashboardStats: build.query<DashboardStats, void>({
      query: () => ({
        url: '/reports/dashboard-stats',
        method: 'GET',
      }),
      transformResponse: (response: any) => {
        const stats = response.data || {};
        const currentMonthIdx = new Date().getMonth();
        const currentMonthSales = stats.monthlySales?.[currentMonthIdx]?.sales || 0;
        return {
          totalRevenue: stats.totalRevenue || 0,
          revenueDelta: stats.revenueDelta || 0,
          totalOrders: stats.orderCount || 0,
          ordersDelta: stats.ordersDelta || 0,
          totalUsers: stats.userCount || 0,
          usersDelta: stats.usersDelta || 0,
          pendingPayments: stats.pendingOfflinePayments || 0,
          pendingPaymentsAmount: stats.pendingPaymentsAmount || 0,
          activeManagers: stats.activeManagers || 0,
          activeExecutives: stats.activeExecutives || 0,
          productStock: stats.productStock || 0,
          monthlySales: currentMonthSales,
          monthlySalesDelta: stats.monthlySalesDelta || 0,
        };
      },
    }),
    getSalesSeries: build.query<SalesPoint[], void>({
      query: () => ({
        url: '/reports/sales-series',
        method: 'GET',
      }),
      transformResponse: (response: any) => {
        const data = response.data || [];
        return data.map((item: any) => ({
          label: item.label,
          revenue: item.revenue || 0,
          orders: item.count || 0,
        }));
      },
    }),
    getCategorySales: build.query<CategorySales[], void>({
      query: () => ({
        url: '/reports/category-sales',
        method: 'GET',
      }),
      transformResponse: (response: any) => {
        const data = response.data || [];
        return data.map((item: any) => ({
          name: item.category || 'General',
          value: item.salesAmount || 0,
        }));
      },
    }),
    getAdminUsers: build.query<AdminUser[], void>({
      query: () => ({
        url: '/users/admin/list',
        method: 'GET',
      }),
      transformResponse: (response: any) => {
        const users = response.data?.users || [];
        return users.map((u: any) => ({
          id: u._id,
          name: u.name || '',
          company: u.companyName || u.name || '',
          email: u.email || '',
          mobile: u.mobile || '',
          city: u.city || '',
          joinedOn: u.createdAt || new Date().toISOString(),
          status: u.status || 'active',
          ordersCount: 0,
          totalSpend: 0,
          docStatus: u.kycVerified ? 'verified' : 'pending',
        }));
      },
      providesTags: ['AdminUser'],
    }),
    getManagers: build.query<ManagerRow[], void>({
      query: () => ({
        url: '/users/admin/sales/managers',
        method: 'GET',
      }),
      transformResponse: (response: any) => {
        const managers = response.data || [];
        return managers.map((m: any) => ({
          id: m._id,
          name: m.name || '',
          email: m.email || '',
          region: m.region || '',
          teamSize: 0,
          revenue: 0,
          target: m.target || 0,
          status: m.status || 'active',
        }));
      },
    }),
    getExecutiveApprovals: build.query<ExecutiveApproval[], void>({
      query: () => ({
        url: '/users/admin/sales/executive-approvals',
        method: 'GET',
      }),
      transformResponse: (response: any) => {
        const executives = response.data || [];
        return executives.map((u: any) => {
          let status: 'pending' | 'approved' | 'rejected' = 'pending';
          if (u.status === 'active') status = 'approved';
          else if (u.status === 'blocked') status = 'rejected';
          return {
            id: u._id,
            name: u.name || '',
            manager: u.managerId?.name || u.managerId || 'Unassigned',
            region: u.region || '',
            requestedOn: u.createdAt || new Date().toISOString(),
            status,
          };
        });
      },
      providesTags: ['Executive'],
    }),
    getStockRequests: build.query<StockRequest[], void>({
      query: () => ({
        url: '/inventory/stock-requests',
        method: 'GET',
      }),
      transformResponse: (response: any) => {
        const requests = response.data?.stockRequests || [];
        return requests.map((sr: any) => ({
          id: sr._id,
          productName: sr.productName || '',
          category: sr.category || '',
          manager: sr.requesterId?.name || 'Unknown',
          type: sr.type || 'add',
          currentStock: sr.currentStock || 0,
          requestedChange: sr.requestedChange || 0,
          requestedOn: sr.createdAt || new Date().toISOString(),
          status: sr.status || 'pending',
        }));
      },
      providesTags: ['StockRequest'],
    }),

    // ── Sales (Manager + Executive) ───────────────────────────────────────────
    getManagerStats: build.query<SalesStats, void>({
      query: () => ({
        url: '/sales/manager/stats',
        method: 'GET',
      }),
      transformResponse: (response: any) => response.data || {},
    }),
    getExecutiveStats: build.query<SalesStats, void>({
      query: () => ({
        url: '/sales/executive/stats',
        method: 'GET',
      }),
      transformResponse: (response: any) => response.data || {},
    }),
    getExecutives: build.query<Executive[], void>({
      query: () => ({
        url: '/sales/manager/executives',
        method: 'GET',
      }),
      transformResponse: (response: any) => response.data || [],
    }),
    getCrmCustomers: build.query<CRMCustomer[], void>({
      query: () => ({
        url: '/crm/customers',
        method: 'GET',
      }),
      transformResponse: (response: any) => response.data || [],
    }),
    getFollowUps: build.query<FollowUp[], void>({
      query: () => ({
        url: '/crm/follow-ups',
        method: 'GET',
      }),
      transformResponse: (response: any) => {
        const data = response.data || [];
        return data.map((f: any) => ({
          id: f._id,
          customer: f.customer || '',
          company: f.company || '',
          dueOn: f.dueAt || new Date().toISOString(),
          type: f.type || 'call',
          note: f.note || '',
          done: !!f.isDone,
        }));
      },
    }),
    getSalesRecords: build.query<SaleRecord[], void>({
      query: () => ({
        url: '/sales/executive/records',
        method: 'GET',
      }),
      transformResponse: (response: any) => {
        const data = response.data || [];
        return data.map((s: any) => ({
          id: s._id,
          ref: s.ref || '',
          customer: s.customer || '',
          product: s.product || '',
          quantity: s.quantity || 0,
          unit: s.unit || 'kg',
          amount: s.amount || 0,
          date: s.date || new Date().toISOString(),
          paymentStatus: s.paymentStatus || 'pending',
          by: 'Executive',
        }));
      },
    }),
    getVendorPurchases: build.query<VendorPurchase[], void>({
      query: () => ({
        url: '/inventory/vendor-purchases',
        method: 'GET',
      }),
      transformResponse: (response: any) => {
        const data = response.data?.purchases || [];
        return data.map((v: any) => ({
          id: v._id,
          vendor: v.vendorName || '',
          product: v.productName || '',
          quantity: v.quantity || 0,
          unit: v.unit || 'kg',
          buyPrice: v.buyPrice || 0,
          total: v.total || 0,
          date: v.purchaseDate || new Date().toISOString(),
          status: v.status || 'pending',
        }));
      },
    }),
    getIncentiveSeries: build.query<IncentivePoint[], void>({
      query: () => ({
        url: '/sales/executive/incentives',
        method: 'GET',
      }),
      transformResponse: (response: any) => response.data || [],
    }),
    sendOtp: build.mutation<{ mobile: string; message: string }, { mobile: string; purpose: string }>({
      query: (body) => ({
        url: '/auth/send-otp',
        method: 'POST',
        body,
      }),
    }),
    verifyOtp: build.mutation<any, { mobile: string; otpCode: string; purpose: string }>({
      query: (body) => ({
        url: '/auth/verify-otp',
        method: 'POST',
        body,
      }),
    }),
    signupCustomer: build.mutation<any, any>({
      query: (body) => ({
        url: '/auth/signup/customer',
        method: 'POST',
        body,
      }),
    }),
    signupExecutive: build.mutation<any, FormData>({
      query: (body) => ({
        url: '/auth/signup/executive',
        method: 'POST',
        body,
      }),
    }),
    login: build.mutation<any, any>({
      query: (body) => ({
        url: '/auth/login',
        method: 'POST',
        body,
      }),
    }),
    forgotPassword: build.mutation<{ message: string }, { identifier: string }>({
      query: (body) => ({
        url: '/auth/forgot-password',
        method: 'POST',
        body,
      }),
    }),
    resetPassword: build.mutation<{ message: string }, { token: string; password: string }>({
      query: (body) => ({
        url: '/auth/reset-password',
        method: 'POST',
        body,
      }),
    }),
    createOrder: build.mutation<any, any>({
      query: (body) => ({
        url: '/orders',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Order', 'Product'],
    }),
    updateProfile: build.mutation<any, any>({
      query: (body) => ({
        url: '/users/me',
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['AdminUser'],
    }),
    uploadDocument: build.mutation<any, FormData>({
      query: (body) => ({
        url: '/users/me/documents',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Document'],
    }),
    updateOrderStatus: build.mutation<any, { id: string; status: string; reason?: string }>({
      query: ({ id, ...body }) => ({
        url: `/orders/admin/${id}/status`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Order'],
    }),
    verifyPayment: build.mutation<any, { transactionId: string }>({
      query: ({ transactionId }) => ({
        url: `/payments/admin/${transactionId}/verify`,
        method: 'POST',
      }),
      invalidatesTags: ['Order'],
    }),
    updateUserStatus: build.mutation<any, { id: string; status: string }>({
      query: ({ id, ...body }) => ({
        url: `/users/admin/${id}/status`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['AdminUser'],
    }),
    verifyUserKyc: build.mutation<any, { id: string; kycVerified: boolean }>({
      query: ({ id, ...body }) => ({
        url: `/users/admin/${id}/kyc`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['AdminUser'],
    }),
    updateStockRequest: build.mutation<any, { id: string; status: 'approved' | 'rejected'; rejectionReason?: string }>({
      query: ({ id, ...body }) => ({
        url: `/inventory/stock-requests/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['StockRequest', 'Product'],
    }),
    createCategory: build.mutation<any, { name: string; image?: string; order?: number }>({
      query: (body) => ({
        url: '/categories',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Category'],
    }),
    createProduct: build.mutation<any, any>({
      query: (body) => ({
        url: '/products',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Product'],
    }),
    updateProduct: build.mutation<any, { id: string; [key: string]: any }>({
      query: ({ id, ...body }) => ({
        url: `/products/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Product'],
    }),
    deleteProduct: build.mutation<any, string>({
      query: (id) => ({
        url: `/products/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Product'],
    }),
  }),
})

export const {
  useGetProductsQuery,
  useGetProductQuery,
  useGetCategoriesQuery,
  useGetBannersQuery,
  useGetOrdersQuery,
  useGetOrderQuery,
  useGetTransactionsQuery,
  useGetDocumentsQuery,
  useGetDashboardStatsQuery,
  useGetSalesSeriesQuery,
  useGetCategorySalesQuery,
  useGetAdminUsersQuery,
  useGetManagersQuery,
  useGetExecutiveApprovalsQuery,
  useGetStockRequestsQuery,
  useGetManagerStatsQuery,
  useGetExecutiveStatsQuery,
  useGetExecutivesQuery,
  useGetCrmCustomersQuery,
  useGetFollowUpsQuery,
  useGetSalesRecordsQuery,
  useGetVendorPurchasesQuery,
  useGetIncentiveSeriesQuery,
  useSendOtpMutation,
  useVerifyOtpMutation,
  useSignupCustomerMutation,
  useSignupExecutiveMutation,
  useLoginMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useCreateOrderMutation,
  useUpdateProfileMutation,
  useUploadDocumentMutation,
  useUpdateOrderStatusMutation,
  useVerifyPaymentMutation,
  useUpdateUserStatusMutation,
  useVerifyUserKycMutation,
  useUpdateStockRequestMutation,
  useCreateCategoryMutation,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} = api
