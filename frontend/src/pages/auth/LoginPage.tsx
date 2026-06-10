import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom'
import { Box, Typography, Button, Divider } from '@mui/material'
import RHFTextField from '@/components/forms/RHFTextField'
import { ROUTES } from '@/constants'

const mobileSchema = z.object({
  mobile: z.string().regex(/^[0-9+\s-]{10,15}$/, 'Enter a valid mobile number'),
})
type MobileForm = z.infer<typeof mobileSchema>

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? ROUTES.home

  const mobileForm = useForm<MobileForm>({ resolver: zodResolver(mobileSchema), defaultValues: { mobile: '9876543210' } })

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

      <Divider sx={{ my: 3.5, color: 'var(--ink-400)', fontSize: 12.5 }}>NEW TO AGRIPORT?</Divider>
      <Button component={RouterLink} to={ROUTES.signup} variant="outlined" fullWidth size="large">
        Create a business account
      </Button>
    </Box>
  )
}
