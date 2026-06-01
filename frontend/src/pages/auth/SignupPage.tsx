import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { Box, Typography, Button, MenuItem, Link as MuiLink } from '@mui/material'
import RHFTextField from '@/components/forms/RHFTextField'
import { BUSINESS_TYPES, ROUTES } from '@/constants'

const schema = z.object({
  fullName: z.string().min(2, 'Enter your full name'),
  mobile: z.string().regex(/^[0-9+\s-]{10,15}$/, 'Enter a valid mobile number'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Minimum 6 characters'),
  companyName: z.string().min(2, 'Company / shop name is required'),
  businessType: z.string().min(1, 'Select a business type'),
  gstNumber: z.string().min(10, 'Enter a valid GST number'),
  country: z.string().min(2, 'Required'),
  state: z.string().min(2, 'Required'),
  city: z.string().min(2, 'Required'),
  address: z.string().min(6, 'Enter your full address'),
})
type Form = z.infer<typeof schema>

export default function SignupPage() {
  const navigate = useNavigate()
  const { control, handleSubmit } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: '', mobile: '', email: '', password: '', companyName: '',
      businessType: '', gstNumber: '', country: 'India', state: '', city: '', address: '',
    },
  })

  const onSubmit = (data: Form) => {
    navigate(ROUTES.otp, { state: { mobile: data.mobile, signup: true } })
  }

  return (
    <Box>
      <Typography variant="h3" sx={{ fontSize: 30, mb: 0.5 }}>
        Create your account
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Set up your business profile to start trading wholesale.
      </Typography>

      <Box component="form" onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <RHFTextField control={control} name="fullName" label="Full name" />
        <RHFTextField control={control} name="mobile" label="Mobile number" placeholder="+91 …" />
        <RHFTextField control={control} name="email" label="Email address" />
        <RHFTextField control={control} name="password" label="Password" type="password" />
        <RHFTextField control={control} name="companyName" label="Company / Shop name" />
        <RHFTextField control={control} name="businessType" label="Business type" select>
          {BUSINESS_TYPES.map((b) => (
            <MenuItem key={b} value={b}>
              {b}
            </MenuItem>
          ))}
        </RHFTextField>
        <RHFTextField control={control} name="gstNumber" label="GST number" />
        <RHFTextField control={control} name="country" label="Country" />
        <RHFTextField control={control} name="state" label="State" />
        <RHFTextField control={control} name="city" label="City" />
        <Box className="sm:col-span-2">
          <RHFTextField control={control} name="address" label="Business address" multiline minRows={2} />
        </Box>
        <Box className="sm:col-span-2 mt-1">
          <Button type="submit" variant="contained" size="large" fullWidth>
            Continue — Verify mobile
          </Button>
        </Box>
      </Box>

      <Typography sx={{ mt: 3, fontSize: 14, textAlign: 'center', color: 'var(--ink-500)' }}>
        Already registered?{' '}
        <MuiLink component={RouterLink} to={ROUTES.login} underline="hover" sx={{ fontWeight: 600 }}>
          Sign in
        </MuiLink>
      </Typography>
    </Box>
  )
}
