import SpaceDashboardRoundedIcon from '@mui/icons-material/SpaceDashboardRounded'
import ContactsRoundedIcon from '@mui/icons-material/ContactsRounded'
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded'
import PointOfSaleRoundedIcon from '@mui/icons-material/PointOfSaleRounded'
import RedeemRoundedIcon from '@mui/icons-material/RedeemRounded'
import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded'
import StorefrontRoundedIcon from '@mui/icons-material/StorefrontRounded'
import WorkspaceLayout from './WorkspaceLayout'
import type { WorkspaceConfig } from './WorkspaceLayout'
import { ROUTES } from '@/constants'

const config: WorkspaceConfig = {
  subtitle: 'Sales Executive App',
  navLabel: 'SALES EXECUTIVE',
  nav: [
    { label: 'Dashboard', to: '/executive', icon: <SpaceDashboardRoundedIcon />, end: true },
    { label: 'Customers', to: '/executive/customers', icon: <ContactsRoundedIcon /> },
    { label: 'Enquiries', to: '/executive/enquiries', icon: <ReceiptLongRoundedIcon /> },
    { label: 'New Sale', to: '/executive/sales', icon: <PointOfSaleRoundedIcon /> },
    { label: 'Products', to: '/executive/products', icon: <Inventory2RoundedIcon /> },
    { label: 'My Incentives', to: '/executive/incentives', icon: <RedeemRoundedIcon /> },
  ],
  titles: {
    '/executive': 'Dashboard',
    '/executive/customers': 'Customer Management',
    '/executive/enquiries': 'Customer Enquiries',
    '/executive/sales': 'Sales Operations',
    '/executive/products': 'Product Management',
    '/executive/incentives': 'My Incentives',
  },
  user: { name: 'Rahul Verma', role: 'Sales Executive · Pune', initials: 'RV' },
  exit: { to: ROUTES.home, label: 'Customer App', icon: <StorefrontRoundedIcon /> },
  loginPath: '/executive/login',
}

export default function ExecutiveLayout() {
  return <WorkspaceLayout config={config} />
}
