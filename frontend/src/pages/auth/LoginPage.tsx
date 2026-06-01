import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom'
import { Box, Typography, Button, Tabs, Tab, Link as MuiLink, Divider, InputAdornment, IconButton } from '@mui/material'
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded'
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded'
import RHFTextField from '@/components/forms/RHFTextField'
import { useAppDispatch } from '@/redux/hooks'
import { signIn } from '@/redux/slices/authSlice'
import { ROUTES } from '@/constants'
import toast from 'react-hot-toast'

const emailSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})
const mobileSchema = z.object({
  mobile: z.string().regex(/^[0-9+\s-]{10,15}$/, 'Enter a valid mobile number'),
})
type EmailForm = z.infer<typeof emailSchema>
type MobileForm = z.infer<typeof mobileSchema>

export default function LoginPage() {
  const [tab, setTab] = useState<'email' | 'mobile'>('email')
  const [showPw, setShowPw] = useState(false)
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? ROUTES.home

  const emailForm = useForm<EmailForm>({ resolver: zodResolver(emailSchema), defaultValues: { email: '', password: '' } })
  const mobileForm = useForm<MobileForm>({ resolver: zodResolver(mobileSchema), defaultValues: { mobile: '' } })

  const onEmailSubmit = () => {
    dispatch(signIn())
    toast.success('Welcome back to Agriport')
    navigate(from, { replace: true })
  }
  const onMobileSubmit = (data: MobileForm) => {
    navigate(ROUTES.otp, { state: { mobile: data.mobile, from } })
  }

  return (
    <Box>
      <Typography variant="h3" sx={{ fontSize: 30, mb: 0.5 }}>
        Sign in
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Access your wholesale dashboard, orders and invoices.
      </Typography>

      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        sx={{ mb: 3, minHeight: 40, '& .MuiTab-root': { minHeight: 40 } }}
      >
        <Tab value="email" label="Email & Password" />
        <Tab value="mobile" label="Mobile OTP" />
      </Tabs>

      {tab === 'email' ? (
        <Box component="form" onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="flex flex-col gap-4">
          <RHFTextField control={emailForm.control} name="email" label="Email address" placeholder="you@company.com" />
          <RHFTextField
            control={emailForm.control}
            name="password"
            label="Password"
            type={showPw ? 'text' : 'password'}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setShowPw((s) => !s)} edge="end">
                      {showPw ? <VisibilityOffRoundedIcon fontSize="small" /> : <VisibilityRoundedIcon fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />
          <Box className="flex justify-end -mt-1">
            <MuiLink component={RouterLink} to={ROUTES.forgot} underline="hover" sx={{ fontSize: 13.5, fontWeight: 600 }}>
              Forgot password?
            </MuiLink>
          </Box>
          <Button type="submit" variant="contained" size="large" sx={{ mt: 0.5 }}>
            Sign in
          </Button>
        </Box>
      ) : (
        <Box component="form" onSubmit={mobileForm.handleSubmit(onMobileSubmit)} className="flex flex-col gap-4">
          <RHFTextField
            control={mobileForm.control}
            name="mobile"
            label="Mobile number"
            placeholder="+91 98765 43210"
          />
          <Button type="submit" variant="contained" size="large">
            Send OTP
          </Button>
        </Box>
      )}

      <Divider sx={{ my: 3.5, color: 'var(--ink-400)', fontSize: 12.5 }}>NEW TO GLOBIRA?</Divider>
      <Button component={RouterLink} to={ROUTES.signup} variant="outlined" fullWidth size="large">
        Create a business account
      </Button>
    </Box>
  )
}
