import SpaceDashboardRoundedIcon from '@mui/icons-material/SpaceDashboardRounded'
import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded'
import CategoryRoundedIcon from '@mui/icons-material/CategoryRounded'
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded'
import GroupRoundedIcon from '@mui/icons-material/GroupRounded'
import HubRoundedIcon from '@mui/icons-material/HubRounded'
import WarehouseRoundedIcon from '@mui/icons-material/WarehouseRounded'
import InsightsRoundedIcon from '@mui/icons-material/InsightsRounded'
import StorefrontRoundedIcon from '@mui/icons-material/StorefrontRounded'
import PaletteRoundedIcon from '@mui/icons-material/PaletteRounded'
import WorkspaceLayout from './WorkspaceLayout'
import type { WorkspaceConfig } from './WorkspaceLayout'
import { ROUTES } from '@/constants'

const config: WorkspaceConfig = {
  subtitle: 'Agriport Admin Control Panel',
  navLabel: 'MANAGEMENT',
  nav: [
    { label: 'Dashboard', to: '/admin', icon: <SpaceDashboardRoundedIcon />, end: true },
    { label: 'Products', to: '/admin/products', icon: <Inventory2RoundedIcon /> },
    { label: 'Categories', to: '/admin/categories', icon: <CategoryRoundedIcon /> },
    { label: 'Orders & Payments', to: '/admin/orders', icon: <ReceiptLongRoundedIcon /> },
    { label: 'Users', to: '/admin/users', icon: <GroupRoundedIcon /> },
    { label: 'Sales Team', to: '/admin/sales', icon: <HubRoundedIcon /> },
    { label: 'Inventory', to: '/admin/inventory', icon: <WarehouseRoundedIcon /> },
    { label: 'Reports', to: '/admin/reports', icon: <InsightsRoundedIcon /> },
    { label: 'Storefront', to: '/admin/storefront', icon: <PaletteRoundedIcon /> },
  ],
  titles: {
    '/admin': 'Dashboard',
    '/admin/products': 'Product Management',
    '/admin/categories': 'Category Management',
    '/admin/orders': 'Order & Payment Management',
    '/admin/users': 'User Management',
    '/admin/sales': 'Sales Team Management',
    '/admin/inventory': 'Inventory & Stock Approvals',
    '/admin/reports': 'Reports & Analytics',
    '/admin/storefront': 'Storefront Content',
  },
  user: { name: 'Admin', role: 'Super Admin', initials: 'AD' },
  exit: { to: ROUTES.home, label: 'Customer App', icon: <StorefrontRoundedIcon /> },
  loginPath: '/admin/login',
}

export default function AdminLayout() {
  return <WorkspaceLayout config={config} />
}
