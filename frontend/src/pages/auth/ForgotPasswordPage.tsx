import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate, Link as RouterLink } from 'react-router-dom'
import { Box, Typography, Button, Link as MuiLink } from '@mui/material'
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded'
import RHFTextField from '@/components/forms/RHFTextField'
import { ROUTES } from '@/constants'
import toast from 'react-hot-toast'

const schema = z.object({
  identifier: z.string().min(1, 'Enter your registered email or mobile'),
})
type Form = z.infer<typeof schema>

export default function ForgotPasswordPage() {
  const navigate = useNavigate()
  const { control, handleSubmit } = useForm<Form>({ resolver: zodResolver(schema), defaultValues: { identifier: '' } })

  const onSubmit = (data: Form) => {
    toast.success('Recovery OTP sent')
    navigate(ROUTES.reset, { state: { identifier: data.identifier } })
  }

  return (
    <Box>
      <MuiLink
        component={RouterLink}
        to={ROUTES.login}
        underline="none"
        sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, color: 'var(--ink-500)', fontSize: 13.5, mb: 3, fontWeight: 600 }}
      >
        <ArrowBackRoundedIcon sx={{ fontSize: 18 }} /> Back to sign in
      </MuiLink>
      <Typography variant="h3" sx={{ fontSize: 30, mb: 0.5 }}>
        Reset password
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3.5 }}>
        Enter your registered email or mobile and we'll send a verification code to reset your password.
      </Typography>
      <Box component="form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <RHFTextField control={control} name="identifier" label="Email or mobile number" />
        <Button type="submit" variant="contained" size="large">
          Send recovery code
        </Button>
      </Box>
    </Box>
  )
}
