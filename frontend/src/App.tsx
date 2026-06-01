import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AppProviders from '@/providers/AppProviders'
import ProtectedRoute from '@/routes/ProtectedRoute'
import RoleRoute from '@/routes/RoleRoute'
import PageFallback from '@/components/common/PageFallback'

// Layouts are eager (shared shell); page chunks load lazily per route so the
// customer, auth and admin areas each ship as their own bundle.
import AuthLayout from '@/layouts/AuthLayout'
import CustomerLayout from '@/layouts/CustomerLayout'
import AdminLayout from '@/layouts/AdminLayout'
import ManagerLayout from '@/layouts/ManagerLayout'
import ExecutiveLayout from '@/layouts/ExecutiveLayout'

// Auth
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'))
const SignupPage = lazy(() => import('@/pages/auth/SignupPage'))
const OtpPage = lazy(() => import('@/pages/auth/OtpPage'))
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage'))
const ResetPasswordPage = lazy(() => import('@/pages/auth/ResetPasswordPage'))
const StaffLoginPage = lazy(() => import('@/pages/auth/StaffLoginPage'))

// Customer
const HomePage = lazy(() => import('@/pages/customer/HomePage'))
const ProductsPage = lazy(() => import('@/pages/customer/ProductsPage'))
const ProductDetailPage = lazy(() => import('@/pages/customer/ProductDetailPage'))
const CartPage = lazy(() => import('@/pages/customer/CartPage'))
const CheckoutPage = lazy(() => import('@/pages/customer/CheckoutPage'))
const OrdersPage = lazy(() => import('@/pages/customer/OrdersPage'))
const OrderDetailPage = lazy(() => import('@/pages/customer/OrderDetailPage'))
const ProfilePage = lazy(() => import('@/pages/customer/ProfilePage'))

// Admin
const DashboardPage = lazy(() => import('@/pages/admin/DashboardPage'))
const ProductsAdminPage = lazy(() => import('@/pages/admin/ProductsAdminPage'))
const OrdersAdminPage = lazy(() => import('@/pages/admin/OrdersAdminPage'))
const UsersAdminPage = lazy(() => import('@/pages/admin/UsersAdminPage'))
const SalesAdminPage = lazy(() => import('@/pages/admin/SalesAdminPage'))
const InventoryAdminPage = lazy(() => import('@/pages/admin/InventoryAdminPage'))
const ReportsAdminPage = lazy(() => import('@/pages/admin/ReportsAdminPage'))

// Manager
const ManagerDashboardPage = lazy(() => import('@/pages/manager/ManagerDashboardPage'))
const TeamPage = lazy(() => import('@/pages/manager/TeamPage'))
const SellingPage = lazy(() => import('@/pages/manager/SellingPage'))
const PurchasePage = lazy(() => import('@/pages/manager/PurchasePage'))
const StockRequestsPage = lazy(() => import('@/pages/manager/StockRequestsPage'))
const ManagerIncentivesPage = lazy(() => import('@/pages/manager/IncentivesPage'))
const AnalyticsPage = lazy(() => import('@/pages/manager/AnalyticsPage'))

// Executive
const ExecutiveDashboardPage = lazy(() => import('@/pages/executive/ExecutiveDashboardPage'))
const CustomersPage = lazy(() => import('@/pages/executive/CustomersPage'))
const ExecutiveSalesPage = lazy(() => import('@/pages/executive/ExecutiveSalesPage'))
const ExecutiveIncentivesPage = lazy(() => import('@/pages/executive/ExecutiveIncentivesPage'))

// Misc
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))

export default function App() {
  return (
    <AppProviders>
      <BrowserRouter>
        <Suspense fallback={<PageFallback />}>
        <Routes>
          {/* Auth */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/verify-otp" element={<OtpPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
          </Route>

          {/* Customer app */}
          <Route element={<CustomerLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/products/:id" element={<ProductDetailPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
            <Route path="/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
            <Route path="/orders/:id" element={<ProtectedRoute><OrderDetailPage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          </Route>

          {/* Staff login portals */}
          <Route path="/admin/login" element={<StaffLoginPage role="admin" />} />
          <Route path="/manager/login" element={<StaffLoginPage role="manager" />} />
          <Route path="/executive/login" element={<StaffLoginPage role="executive" />} />

          {/* Admin panel */}
          <Route
            path="/admin"
            element={
              <RoleRoute role="admin">
                <AdminLayout />
              </RoleRoute>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="products" element={<ProductsAdminPage />} />
            <Route path="orders" element={<OrdersAdminPage />} />
            <Route path="users" element={<UsersAdminPage />} />
            <Route path="sales" element={<SalesAdminPage />} />
            <Route path="inventory" element={<InventoryAdminPage />} />
            <Route path="reports" element={<ReportsAdminPage />} />
          </Route>

          {/* Sales Manager workspace */}
          <Route
            path="/manager"
            element={
              <RoleRoute role="manager">
                <ManagerLayout />
              </RoleRoute>
            }
          >
            <Route index element={<ManagerDashboardPage />} />
            <Route path="team" element={<TeamPage />} />
            <Route path="selling" element={<SellingPage />} />
            <Route path="purchase" element={<PurchasePage />} />
            <Route path="stock" element={<StockRequestsPage />} />
            <Route path="incentives" element={<ManagerIncentivesPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
          </Route>

          {/* Sales Executive workspace */}
          <Route
            path="/executive"
            element={
              <RoleRoute role="executive">
                <ExecutiveLayout />
              </RoleRoute>
            }
          >
            <Route index element={<ExecutiveDashboardPage />} />
            <Route path="customers" element={<CustomersPage />} />
            <Route path="sales" element={<ExecutiveSalesPage />} />
            <Route path="incentives" element={<ExecutiveIncentivesPage />} />
          </Route>

          <Route path="/404" element={<NotFoundPage />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
        </Suspense>
      </BrowserRouter>
    </AppProviders>
  )
}
