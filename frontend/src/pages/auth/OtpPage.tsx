import { useRef, useState, useEffect } from 'react'
import type { ClipboardEvent, KeyboardEvent } from 'react'
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom'
import { Box, Typography, Button, Link as MuiLink } from '@mui/material'
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded'
import { useAppDispatch } from '@/redux/hooks'
import { signIn } from '@/redux/slices/authSlice'
import { ROUTES } from '@/constants'
import toast from 'react-hot-toast'

const LEN = 6

export default function OtpPage() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const location = useLocation()
  const state = (location.state as { mobile?: string; from?: string; signup?: boolean } | null) ?? {}
  const mobile = state.mobile ?? 'your mobile'

  const [digits, setDigits] = useState<string[]>(Array(LEN).fill(''))
  const [seconds, setSeconds] = useState(30)
  const inputs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    inputs.current[0]?.focus()
  }, [])
  useEffect(() => {
    if (seconds <= 0) return
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000)
    return () => clearTimeout(t)
  }, [seconds])

  const setAt = (i: number, val: string) => {
    setDigits((prev) => {
      const next = [...prev]
      next[i] = val
      return next
    })
  }

  const handleChange = (i: number, val: string) => {
    const d = val.replace(/\D/g, '').slice(-1)
    setAt(i, d)
    if (d && i < LEN - 1) inputs.current[i + 1]?.focus()
  }
  const handleKey = (i: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) inputs.current[i - 1]?.focus()
  }
  const handlePaste = (e: ClipboardEvent) => {
    e.preventDefault()
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, LEN)
    if (!text) return
    const next = Array(LEN).fill('')
    text.split('').forEach((c, idx) => (next[idx] = c))
    setDigits(next)
    inputs.current[Math.min(text.length, LEN - 1)]?.focus()
  }

  const code = digits.join('')
  const complete = code.length === LEN

  const verify = () => {
    dispatch(signIn())
    toast.success(state.signup ? 'Account verified — welcome to Agriport!' : 'Verified successfully')
    navigate(state.from ?? ROUTES.home, { replace: true })
  }

  return (
    <Box>
      <MuiLink
        component={RouterLink}
        to={state.signup ? ROUTES.signup : ROUTES.login}
        underline="none"
        sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, color: 'var(--ink-500)', fontSize: 13.5, mb: 3, fontWeight: 600 }}
      >
        <ArrowBackRoundedIcon sx={{ fontSize: 18 }} /> Back
      </MuiLink>

      <Typography variant="h3" sx={{ fontSize: 30, mb: 0.5 }}>
        Verify your mobile
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 4 }}>
        We sent a 6-digit code to <strong style={{ color: 'var(--ink-900)' }}>{mobile}</strong>.
        Enter it below to continue. <em>(Demo: any 6 digits work.)</em>
      </Typography>

      <Box className="flex gap-2 sm:gap-3 mb-6" onPaste={handlePaste}>
        {digits.map((d, i) => (
          <input
            key={i}
            ref={(el) => {
              inputs.current[i] = el
            }}
            value={d}
            inputMode="numeric"
            maxLength={1}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKey(i, e)}
            className="tnum"
            style={{
              width: 52,
              height: 60,
              textAlign: 'center',
              fontSize: 24,
              fontWeight: 700,
              borderRadius: 12,
              border: `1.5px solid ${d ? 'var(--brand-500)' : 'var(--ink-200)'}`,
              outline: 'none',
              background: '#fff',
              color: 'var(--ink-900)',
              transition: 'border-color .15s',
            }}
          />
        ))}
      </Box>

      <Button variant="contained" size="large" fullWidth disabled={!complete} onClick={verify}>
        Verify & continue
      </Button>

      <Typography sx={{ mt: 3, textAlign: 'center', fontSize: 14, color: 'var(--ink-500)' }}>
        Didn't get the code?{' '}
        {seconds > 0 ? (
          <span className="tnum">Resend in {seconds}s</span>
        ) : (
          <MuiLink
            component="button"
            type="button"
            underline="hover"
            sx={{ fontWeight: 600 }}
            onClick={() => {
              setSeconds(30)
              toast.success('OTP resent')
            }}
          >
            Resend OTP
          </MuiLink>
        )}
      </Typography>
    </Box>
  )
}
