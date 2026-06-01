import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react'
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
import {
  products as mockProducts,
  categories as mockCategories,
  orders as mockOrders,
  transactions as mockTransactions,
  documents as mockDocuments,
  banners as mockBanners,
} from '@/mocks/data'
import {
  dashboardStats,
  salesSeries,
  categorySales,
  adminUsers,
  managers,
  executiveApprovals,
  stockRequests,
} from '@/mocks/adminData'
import {
  managerStats,
  executiveStats,
  executives,
  crmCustomers,
  followUps,
  salesRecords,
  vendorPurchases,
  incentiveSeries,
} from '@/mocks/salesData'

// Simulated network latency so loading states are exercised in the UI.
const delay = <T>(data: T, ms = 450): Promise<{ data: T }> =>
  new Promise((resolve) => setTimeout(() => resolve({ data }), ms))

export interface ProductQuery {
  search?: string
  category?: string
  sort?: 'relevance' | 'price_asc' | 'price_desc' | 'rating'
  inStockOnly?: boolean
}

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fakeBaseQuery(),
  tagTypes: ['Product', 'Order', 'Document', 'AdminUser', 'StockRequest', 'Executive'],
  endpoints: (build) => ({
    getProducts: build.query<Product[], ProductQuery | void>({
      queryFn: async (arg) => {
        let list = [...mockProducts]
        const q = arg || {}
        if (q.search) {
          const s = q.search.toLowerCase()
          list = list.filter(
            (p) => p.name.toLowerCase().includes(s) || p.category.toLowerCase().includes(s),
          )
        }
        if (q.category && q.category !== 'all') {
          list = list.filter((p) => p.category === q.category)
        }
        if (q.inStockOnly) list = list.filter((p) => p.stockStatus !== 'out_of_stock')
        switch (q.sort) {
          case 'price_asc':
            list.sort((a, b) => a.basePrice - b.basePrice)
            break
          case 'price_desc':
            list.sort((a, b) => b.basePrice - a.basePrice)
            break
          case 'rating':
            list.sort((a, b) => b.rating - a.rating)
            break
        }
        return delay(list)
      },
      providesTags: ['Product'],
    }),
    getProduct: build.query<Product | undefined, string>({
      queryFn: async (id) => delay(mockProducts.find((p) => p.id === id)),
      providesTags: ['Product'],
    }),
    getCategories: build.query<Category[], void>({
      queryFn: async () => delay(mockCategories, 200),
    }),
    getBanners: build.query<Banner[], void>({
      queryFn: async () => delay(mockBanners, 150),
    }),
    getOrders: build.query<Order[], void>({
      queryFn: async () => delay(mockOrders),
      providesTags: ['Order'],
    }),
    getOrder: build.query<Order | undefined, string>({
      queryFn: async (id) => delay(mockOrders.find((o) => o.id === id)),
      providesTags: ['Order'],
    }),
    getTransactions: build.query<Transaction[], void>({
      queryFn: async () => delay(mockTransactions),
    }),
    getDocuments: build.query<BusinessDocument[], void>({
      queryFn: async () => delay(mockDocuments),
      providesTags: ['Document'],
    }),

    // ── Admin ────────────────────────────────────────────────────────────────
    getDashboardStats: build.query<DashboardStats, void>({
      queryFn: async () => delay(dashboardStats, 250),
    }),
    getSalesSeries: build.query<SalesPoint[], void>({
      queryFn: async () => delay(salesSeries, 250),
    }),
    getCategorySales: build.query<CategorySales[], void>({
      queryFn: async () => delay(categorySales, 250),
    }),
    getAdminUsers: build.query<AdminUser[], void>({
      queryFn: async () => delay(adminUsers),
      providesTags: ['AdminUser'],
    }),
    getManagers: build.query<ManagerRow[], void>({
      queryFn: async () => delay(managers),
    }),
    getExecutiveApprovals: build.query<ExecutiveApproval[], void>({
      queryFn: async () => delay(executiveApprovals),
      providesTags: ['Executive'],
    }),
    getStockRequests: build.query<StockRequest[], void>({
      queryFn: async () => delay(stockRequests),
      providesTags: ['StockRequest'],
    }),

    // ── Sales (Manager + Executive) ───────────────────────────────────────────
    getManagerStats: build.query<SalesStats, void>({
      queryFn: async () => delay(managerStats, 250),
    }),
    getExecutiveStats: build.query<SalesStats, void>({
      queryFn: async () => delay(executiveStats, 250),
    }),
    getExecutives: build.query<Executive[], void>({
      queryFn: async () => delay(executives),
    }),
    getCrmCustomers: build.query<CRMCustomer[], void>({
      queryFn: async () => delay(crmCustomers),
    }),
    getFollowUps: build.query<FollowUp[], void>({
      queryFn: async () => delay(followUps),
    }),
    getSalesRecords: build.query<SaleRecord[], void>({
      queryFn: async () => delay(salesRecords),
    }),
    getVendorPurchases: build.query<VendorPurchase[], void>({
      queryFn: async () => delay(vendorPurchases),
    }),
    getIncentiveSeries: build.query<IncentivePoint[], void>({
      queryFn: async () => delay(incentiveSeries, 250),
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
} = api
