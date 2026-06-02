import { useState, Suspense } from 'react'
import type { FormEvent } from 'react'
import { Outlet, Link as RouterLink, useNavigate, useLocation } from 'react-router-dom'
import PageFallback from '@/components/common/PageFallback'
import {
  AppBar,
  Toolbar,
  Box,
  Button,
  IconButton,
  Badge,
  InputBase,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  ListItemIcon,
  Typography,
  Container,
  Link as MuiLink,
  Paper,
} from '@mui/material'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import ShoppingCartRoundedIcon from '@mui/icons-material/ShoppingCartRounded'
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded'
import PersonRoundedIcon from '@mui/icons-material/PersonRounded'
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded'
import StorefrontRoundedIcon from '@mui/icons-material/StorefrontRounded'
import HomeRoundedIcon from '@mui/icons-material/HomeRounded'
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded'
import Logo from '@/components/common/Logo'
import { ROUTES } from '@/constants'
import { useAppDispatch, useAppSelector, useCartCount } from '@/redux/hooks'
import { signOut } from '@/redux/slices/authSlice'
import { initials } from '@/utils/format'
import toast from 'react-hot-toast'

const NAV = [
  { label: 'Marketplace', to: ROUTES.products, icon: <StorefrontRoundedIcon sx={{ fontSize: 19 }} /> },
  { label: 'My Orders', to: ROUTES.orders, icon: <ReceiptLongRoundedIcon sx={{ fontSize: 19 }} /> },
]

export default function CustomerLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useAppDispatch()
  const cartCount = useCartCount()
  const user = useAppSelector((s) => s.auth.user)
  const isAuthed = useAppSelector((s) => s.auth.status === 'authenticated')
  const [anchor, setAnchor] = useState<null | HTMLElement>(null)
  const [search, setSearch] = useState('')

  const onSearch = (e: FormEvent) => {
    e.preventDefault()
    navigate(`${ROUTES.products}?search=${encodeURIComponent(search)}`)
  }

  const handleSignOut = () => {
    setAnchor(null)
    dispatch(signOut())
    toast.success('Signed out')
    navigate(ROUTES.home)
  }

  const isActive = (to: string) =>
    to === ROUTES.products ? location.pathname.startsWith('/products') : location.pathname === to

  const showBack = location.pathname !== '/'

  return (
    <Box className="app-canvas min-h-screen flex flex-col">
      <AppBar position="sticky">
        <Toolbar sx={{ minHeight: { xs: 60, md: 68 }, px: { xs: 2, md: 3 }, gap: 1.5 }}>
          {showBack && (
            <IconButton onClick={() => navigate(-1)} sx={{ color: 'var(--ink-800)', ml: -1 }}>
              <ArrowBackRoundedIcon />
            </IconButton>
          )}

          <RouterLink to={ROUTES.home} className="shrink-0">
            <Logo size={34} />
          </RouterLink>

          {/* Search */}
          <Box
            component="form"
            onSubmit={onSearch}
            sx={{
              display: { xs: 'none', md: 'flex' },
              alignItems: 'center',
              flex: 1,
              maxWidth: 460,
              ml: 2,
              px: 1.5,
              height: 42,
              borderRadius: 2.5,
              border: '1px solid var(--ink-200)',
              backgroundColor: 'var(--ink-50)',
              transition: 'border-color .15s',
              '&:focus-within': { borderColor: 'var(--brand-500)', backgroundColor: '#fff' },
            }}
          >
            <SearchRoundedIcon sx={{ color: 'var(--ink-500)', fontSize: 20 }} />
            <InputBase
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products, categories…"
              sx={{ ml: 1, flex: 1, fontSize: 14 }}
            />
          </Box>

          <Box sx={{ flex: 1, display: { md: 'none' } }} />

          {/* Nav links */}
          <Box sx={{ display: { xs: 'none', lg: 'flex' }, gap: 0.5 }}>
            {NAV.map((n) => (
              <Button
                key={n.to}
                component={RouterLink}
                to={n.to}
                startIcon={n.icon}
                sx={{
                  color: isActive(n.to) ? 'var(--brand-700)' : 'var(--ink-700)',
                  backgroundColor: isActive(n.to) ? 'var(--brand-50)' : 'transparent',
                  fontWeight: 600,
                  px: 1.75,
                  '&:hover': { backgroundColor: 'var(--ink-50)' },
                }}
              >
                {n.label}
              </Button>
            ))}
          </Box>

          <IconButton component={RouterLink} to={ROUTES.cart} sx={{ color: 'var(--ink-800)' }}>
            <Badge badgeContent={cartCount} color="primary" overlap="circular">
              <ShoppingCartRoundedIcon />
            </Badge>
          </IconButton>

          {isAuthed && user ? (
            <>
              <IconButton onClick={(e) => setAnchor(e.currentTarget)} sx={{ p: 0.5 }}>
                <Avatar sx={{ width: 36, height: 36, bgcolor: 'var(--brand-600)', fontSize: 14 }}>
                  {initials(user.fullName)}
                </Avatar>
              </IconButton>
              <Menu
                anchorEl={anchor}
                open={Boolean(anchor)}
                onClose={() => setAnchor(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              >
                <Box sx={{ px: 2, py: 1.25, minWidth: 220 }}>
                  <Typography sx={{ fontWeight: 700, fontSize: 14 }}>{user.fullName}</Typography>
                  <Typography sx={{ fontSize: 12.5, color: 'var(--ink-500)' }}>{user.companyName}</Typography>
                </Box>
                <Divider />
                <MenuItem component={RouterLink} to={ROUTES.profile} onClick={() => setAnchor(null)}>
                  <ListItemIcon>
                    <PersonRoundedIcon fontSize="small" />
                  </ListItemIcon>
                  Profile & Business
                </MenuItem>
                <MenuItem component={RouterLink} to={ROUTES.orders} onClick={() => setAnchor(null)}>
                  <ListItemIcon>
                    <ReceiptLongRoundedIcon fontSize="small" />
                  </ListItemIcon>
                  My Orders
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleSignOut} sx={{ color: 'var(--error, #C0392B)' }}>
                  <ListItemIcon>
                    <LogoutRoundedIcon fontSize="small" sx={{ color: 'inherit' }} />
                  </ListItemIcon>
                  Sign out
                </MenuItem>
              </Menu>
            </>
          ) : (
            <Button variant="contained" component={RouterLink} to={ROUTES.login} sx={{ ml: 0.5 }}>
              Sign in
            </Button>
          )}
        </Toolbar>
      </AppBar>

      <Box component="main" sx={{ flex: 1, pb: 0 }}>
        <Container maxWidth="xl" sx={{ py: { xs: 3, md: 5 } }}>
          <Suspense fallback={<PageFallback />}>
            <Outlet />
          </Suspense>
        </Container>
      </Box>

      <Box component="footer" sx={{ borderTop: '1px solid var(--ink-200)', backgroundColor: '#fff', mt: { xs: 2, md: 4 } }}>
        <Container maxWidth="xl" sx={{ pt: 4, pb: { xs: 12, md: 4 } }}>
          <Box className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <Logo size={30} />
            <Typography sx={{ fontSize: 13, color: 'var(--ink-500)' }}>
              Agriport · B2B Wholesale Trading Platform
            </Typography>
            <Typography sx={{ fontSize: 12.5, color: 'var(--ink-400)' }}>
              © {new Date().getFullYear()} · Confidential — Client Review
            </Typography>
          </Box>
          <Box
            sx={{ mt: 3, pt: 2.5, borderTop: '1px solid var(--ink-100)' }}
            className="flex flex-wrap items-center gap-x-4 gap-y-1"
          >
            <Typography sx={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', color: 'var(--ink-400)' }}>
              STAFF PORTALS
            </Typography>
            {[
              { label: 'Admin', to: '/admin/login' },
              { label: 'Sales Manager', to: '/manager/login' },
              { label: 'Sales Executive', to: '/executive/login' },
            ].map((s) => (
              <MuiLink
                key={s.to}
                component={RouterLink}
                to={s.to}
                underline="hover"
                sx={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink-500)', '&:hover': { color: 'var(--brand-700)' } }}
              >
                {s.label}
              </MuiLink>
            ))}
          </Box>
        </Container>
      </Box>
      {/* Mobile Bottom Navigation Bar */}
      <Paper
        elevation={8}
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: 64,
          display: { xs: 'flex', md: 'none' },
          alignItems: 'center',
          justifyContent: 'space-around',
          borderTop: '1px solid var(--ink-200)',
          borderRadius: 0,
          bgcolor: '#ffffff',
          zIndex: 1000,
          pb: 'env(safe-area-inset-bottom)',
        }}
      >
        {[
          { label: 'Home', to: ROUTES.home, icon: <HomeRoundedIcon sx={{ fontSize: 22 }} /> },
          { label: 'Marketplace', to: ROUTES.products, icon: <StorefrontRoundedIcon sx={{ fontSize: 22 }} /> },
          {
            label: 'Cart',
            to: ROUTES.cart,
            icon: (
              <Badge badgeContent={cartCount} color="primary" overlap="circular">
                <ShoppingCartRoundedIcon sx={{ fontSize: 22 }} />
              </Badge>
            ),
          },
          { label: 'My Orders', to: ROUTES.orders, icon: <ReceiptLongRoundedIcon sx={{ fontSize: 22 }} /> },
          { label: 'Profile', to: ROUTES.profile, icon: <PersonRoundedIcon sx={{ fontSize: 22 }} /> },
        ].map((n) => {
          const active = isActive(n.to)
          return (
            <Box
              key={n.to}
              component={RouterLink}
              to={n.to}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textDecoration: 'none',
                color: active ? 'var(--brand-600)' : 'var(--ink-600)',
                flex: 1,
                height: '100%',
                transition: 'color 0.2s, transform 0.1s',
                '&:active': { transform: 'scale(0.95)' },
              }}
            >
              {n.icon}
              <Typography sx={{ fontSize: 10.5, fontWeight: active ? 750 : 600, mt: 0.5 }}>
                {n.label}
              </Typography>
            </Box>
          )
        })}
      </Paper>
    </Box>
  )
}
