import SpaceDashboardRoundedIcon from '@mui/icons-material/SpaceDashboardRounded'
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded'
import PointOfSaleRoundedIcon from '@mui/icons-material/PointOfSaleRounded'
import ShoppingBagRoundedIcon from '@mui/icons-material/ShoppingBagRounded'
import WarehouseRoundedIcon from '@mui/icons-material/WarehouseRounded'
import RedeemRoundedIcon from '@mui/icons-material/RedeemRounded'
import InsightsRoundedIcon from '@mui/icons-material/InsightsRounded'
import StorefrontRoundedIcon from '@mui/icons-material/StorefrontRounded'
import WorkspaceLayout from './WorkspaceLayout'
import type { WorkspaceConfig } from './WorkspaceLayout'
import { ROUTES } from '@/constants'

const config: WorkspaceConfig = {
  subtitle: 'Sales Manager Workspace',
  navLabel: 'SALES MANAGER',
  nav: [
    { label: 'Dashboard', to: '/manager', icon: <SpaceDashboardRoundedIcon />, end: true },
    { label: 'My Team', to: '/manager/team', icon: <GroupsRoundedIcon /> },
    { label: 'Sell Product', to: '/manager/selling', icon: <PointOfSaleRoundedIcon /> },
    { label: 'Purchase', to: '/manager/purchase', icon: <ShoppingBagRoundedIcon /> },
    { label: 'Stock Requests', to: '/manager/stock', icon: <WarehouseRoundedIcon /> },
    { label: 'Incentives', to: '/manager/incentives', icon: <RedeemRoundedIcon /> },
    { label: 'Analytics', to: '/manager/analytics', icon: <InsightsRoundedIcon /> },
  ],
  titles: {
    '/manager': 'Dashboard',
    '/manager/team': 'Team Management',
    '/manager/selling': 'Product Selling',
    '/manager/purchase': 'Product Purchase',
    '/manager/stock': 'Stock Requests',
    '/manager/incentives': 'Incentive Management',
    '/manager/analytics': 'Sales Analytics',
  },
  user: { name: 'Arjun Desai', role: 'Sales Manager · West', initials: 'AD' },
  exit: { to: ROUTES.home, label: 'Customer App', icon: <StorefrontRoundedIcon /> },
  loginPath: '/manager/login',
}

export default function ManagerLayout() {
  return <WorkspaceLayout config={config} />
}
