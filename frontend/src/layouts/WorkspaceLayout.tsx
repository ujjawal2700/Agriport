import { useState, Suspense } from 'react'
import type { ReactNode } from 'react'
import { Outlet, NavLink, Link as RouterLink, useLocation, useNavigate } from 'react-router-dom'
import {
  Box,
  Drawer,
  IconButton,
  Typography,
  Avatar,
  Tooltip,
  Badge,
  useMediaQuery,
  Divider,
  Button,
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import MenuRoundedIcon from '@mui/icons-material/MenuRounded'
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded'
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded'
import Logo from '@/components/common/Logo'
import PageFallback from '@/components/common/PageFallback'
import { useAppDispatch } from '@/redux/hooks'
import { signOut } from '@/redux/slices/authSlice'
import toast from 'react-hot-toast'

const W = 256

export interface NavItem {
  label: string
  to: string
  icon: ReactNode
  end?: boolean
}

export interface WorkspaceConfig {
  /** App-bar subtitle, e.g. "Sales Manager Workspace" */
  subtitle: string
  nav: NavItem[]
  /** Map of pathname -> page title */
  titles: Record<string, string>
  user: { name: string; role: string; initials: string }
  /** Bottom sidebar link (e.g. back to customer app) */
  exit: { to: string; label: string; icon: ReactNode }
  /** Where sign-out lands (this workspace's login). */
  loginPath: string
  /** Section label above nav */
  navLabel?: string
}

function Sidebar({ config, onNavigate }: { config: WorkspaceConfig; onNavigate?: () => void }) {
  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#0A3324', color: '#fff' }}>
      <Box sx={{ px: 2.5, py: 2.5 }}>
        <Logo light size={32} />
      </Box>
      <Box sx={{ px: 2, py: 1, flex: 1, overflowY: 'auto' }}>
        <Typography sx={{ px: 1.5, py: 1, fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.4)' }}>
          {config.navLabel ?? 'WORKSPACE'}
        </Typography>
        <Box className="flex flex-col gap-1">
          {config.nav.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end} onClick={onNavigate} style={{ textDecoration: 'none' }}>
              {({ isActive }) => (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    px: 1.5,
                    py: 1.25,
                    borderRadius: 2.5,
                    color: isActive ? '#fff' : 'rgba(255,255,255,0.66)',
                    bgcolor: isActive ? 'rgba(56,155,115,0.28)' : 'transparent',
                    fontWeight: 600,
                    fontSize: 14.5,
                    position: 'relative',
                    transition: 'all .15s',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.08)', color: '#fff' },
                    '& svg': { fontSize: 21 },
                    ...(isActive && {
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        left: -8,
                        top: 8,
                        bottom: 8,
                        width: 3,
                        borderRadius: 3,
                        bgcolor: '#66B894',
                      },
                    }),
                  }}
                >
                  {n.icon}
                  {n.label}
                </Box>
              )}
            </NavLink>
          ))}
        </Box>
      </Box>
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />
      <Box sx={{ p: 2 }}>
        <Button
          component={RouterLink}
          to={config.exit.to}
          startIcon={config.exit.icon}
          fullWidth
          sx={{ justifyContent: 'flex-start', color: 'rgba(255,255,255,0.8)', '&:hover': { bgcolor: 'rgba(255,255,255,0.08)' } }}
        >
          {config.exit.label}
        </Button>
      </Box>
    </Box>
  )
}

export default function WorkspaceLayout({ config }: { config: WorkspaceConfig }) {
  const theme = useTheme()
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'))
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const title = config.titles[location.pathname] ?? config.subtitle

  const handleSignOut = () => {
    dispatch(signOut())
    toast.success('Signed out')
    navigate(config.loginPath, { replace: true })
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#F4F6F8' }}>
      {isDesktop ? (
        <Box component="nav" sx={{ width: W, flexShrink: 0 }}>
          <Box sx={{ position: 'fixed', width: W, height: '100vh' }}>
            <Sidebar config={config} />
          </Box>
        </Box>
      ) : (
        <Drawer open={mobileOpen} onClose={() => setMobileOpen(false)} slotProps={{ paper: { sx: { width: W, border: 'none' } } }}>
          <Sidebar config={config} onNavigate={() => setMobileOpen(false)} />
        </Drawer>
      )}

      <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <Box
          sx={{
            position: 'sticky',
            top: 0,
            zIndex: 10,
            height: 64,
            px: { xs: 2, md: 3 },
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            bgcolor: 'rgba(255,255,255,0.85)',
            backdropFilter: 'saturate(180%) blur(12px)',
            borderBottom: '1px solid var(--ink-200)',
          }}
        >
          {!isDesktop && (
            <IconButton onClick={() => setMobileOpen(true)} edge="start">
              <MenuRoundedIcon />
            </IconButton>
          )}
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontFamily: '"Bricolage Grotesque", serif', fontWeight: 700, fontSize: 19, lineHeight: 1.1 }}>
              {title}
            </Typography>
            <Typography sx={{ fontSize: 12, color: 'var(--ink-500)' }}>{config.subtitle}</Typography>
          </Box>
          <Tooltip title="Notifications">
            <IconButton>
              <Badge color="error" variant="dot">
                <NotificationsRoundedIcon />
              </Badge>
            </IconButton>
          </Tooltip>
          <Box className="flex items-center gap-2" sx={{ pl: 1, borderLeft: '1px solid var(--ink-200)' }}>
            <Avatar sx={{ width: 36, height: 36, bgcolor: 'var(--brand-700)', fontSize: 14 }}>{config.user.initials}</Avatar>
            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
              <Typography sx={{ fontWeight: 700, fontSize: 13.5, lineHeight: 1.1 }}>{config.user.name}</Typography>
              <Typography sx={{ fontSize: 11.5, color: 'var(--ink-500)' }}>{config.user.role}</Typography>
            </Box>
            <Tooltip title="Sign out">
              <IconButton onClick={handleSignOut} size="small" sx={{ ml: 0.5 }}>
                <LogoutRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Box component="main" sx={{ p: { xs: 2, md: 3.5 }, flex: 1 }}>
          <Box className="animate-fade-up">
            <Suspense fallback={<PageFallback />}>
              <Outlet />
            </Suspense>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
