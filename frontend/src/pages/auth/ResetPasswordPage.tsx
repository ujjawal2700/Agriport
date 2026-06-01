import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { Box, Typography, Button } from '@mui/material'
import RHFTextField from '@/components/forms/RHFTextField'
import { ROUTES } from '@/constants'
import toast from 'react-hot-toast'

const schema = z
  .object({
    otp: z.string().regex(/^\d{6}$/, 'Enter the 6-digit code'),
    password: z.string().min(6, 'Minimum 6 characters'),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, { message: 'Passwords do not match', path: ['confirm'] })
type Form = z.infer<typeof schema>

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const { control, handleSubmit } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { otp: '', password: '', confirm: '' },
  })

  const onSubmit = () => {
    toast.success('Password updated — please sign in')
    navigate(ROUTES.login)
  }

  return (
    <Box>
      <Typography variant="h3" sx={{ fontSize: 30, mb: 0.5 }}>
        Create new password
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3.5 }}>
        Enter the verification code and choose a new password for your account.
      </Typography>
      <Box component="form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <RHFTextField control={control} name="otp" label="Verification code" placeholder="6-digit OTP" />
        <RHFTextField control={control} name="password" label="New password" type="password" />
        <RHFTextField control={control} name="confirm" label="Confirm new password" type="password" />
        <Button type="submit" variant="contained" size="large" sx={{ mt: 0.5 }}>
          Update password
        </Button>
      </Box>
    </Box>
  )
}
