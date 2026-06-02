import { useState } from 'react'
import type { ReactElement } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Typography,
  Button,
  Radio,
  TextField,
  Divider,
  CircularProgress,
} from '@mui/material'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import AccountBalanceRoundedIcon from '@mui/icons-material/AccountBalanceRounded'
import CreditCardRoundedIcon from '@mui/icons-material/CreditCardRounded'
import QrCodeRoundedIcon from '@mui/icons-material/QrCode2Rounded'
import PaymentsRoundedIcon from '@mui/icons-material/PaymentsRounded'
import ShieldRoundedIcon from '@mui/icons-material/ShieldRounded'
import PageHeader from '@/components/common/PageHeader'
import OrderSummary, { computeTotals } from '@/components/order/OrderSummary'
import EmptyState from '@/components/common/EmptyState'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { clearCart } from '@/redux/slices/cartSlice'
import { PAYMENT_METHODS, ROUTES } from '@/constants'
import type { PaymentMode } from '@/types'
import { formatMoney } from '@/utils/format'
import { currentUser } from '@/mocks/data'
import toast from 'react-hot-toast'

const ICONS: Record<PaymentMode, ReactElement> = {
  upi: <QrCodeRoundedIcon />,
  card: <CreditCardRoundedIcon />,
  gateway: <ShieldRoundedIcon />,
  bank_transfer: <AccountBalanceRoundedIcon />,
  cash: <PaymentsRoundedIcon />,
}

export default function CheckoutPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const items = useAppSelector((s) => s.cart.items)
  const user = useAppSelector((s) => s.auth.user) ?? currentUser
  const [method, setMethod] = useState<PaymentMode>('upi')
  const [placing, setPlacing] = useState(false)
  const [address, setAddress] = useState(user.address ?? '')

  if (items.length === 0) {
    return (
      <EmptyState title="Nothing to check out" actionLabel="Browse marketplace" onAction={() => navigate(ROUTES.products)} />
    )
  }

  const { total } = computeTotals(items)
  const online = PAYMENT_METHODS.filter((m) => m.group === 'online')
  const offline = PAYMENT_METHODS.filter((m) => m.group === 'offline')

  const placeOrder = () => {
    setPlacing(true)
    setTimeout(() => {
      dispatch(clearCart())
      toast.success('Order placed successfully!')
      navigate(`${ROUTES.orders}?placed=1`, { replace: true })
    }, 1400)
  }

  const MethodCard = ({ id, label, description }: { id: PaymentMode; label: string; description: string }) => {
    const selected = method === id
    return (
      <Box
        onClick={() => setMethod(id)}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: { xs: 1.25, md: 1.5 },
          p: { xs: 1.25, md: 1.75 },
          borderRadius: 2,
          cursor: 'pointer',
          border: `1.5px solid ${selected ? 'var(--brand-500)' : 'var(--ink-200)'}`,
          bgcolor: selected ? 'var(--brand-50)' : '#fff',
          transition: 'all .15s',
        }}
      >
        <Radio checked={selected} size="small" sx={{ p: 0 }} />
        <Box sx={{ color: 'var(--brand-700)', display: 'grid', placeItems: 'center', '& svg': { fontSize: { xs: 20, md: 24 } } }}>{ICONS[id]}</Box>
        <Box sx={{ flex: 1 }}>
          <Typography sx={{ fontWeight: 700, fontSize: { xs: 13.5, md: 14.5 } }}>{label}</Typography>
          <Typography sx={{ fontSize: { xs: 11.5, md: 12.5 }, color: 'var(--ink-500)', mt: 0.25 }}>{description}</Typography>
        </Box>
      </Box>
    )
  }

  return (
    <Box className="animate-fade-up">
      <PageHeader
        title="Checkout"
        crumbs={[{ label: 'Home', to: ROUTES.home }, { label: 'Cart', to: ROUTES.cart }, { label: 'Checkout' }]}
      />

      <Box className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Box className="lg:col-span-2 flex flex-col gap-6">
          {/* Delivery */}
          <Box sx={{ borderRadius: 4, border: '1px solid var(--ink-200)', bgcolor: '#fff', p: { xs: 2, md: 3 } }}>
            <Typography variant="h6" sx={{ fontSize: 17, mb: 2 }}>
              Billing & pickup
            </Typography>
            <Box className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <TextField label="Business name" value={user.companyName} size="small" slotProps={{ input: { readOnly: true } }} />
              <TextField label="GST number" value={user.gstNumber} size="small" slotProps={{ input: { readOnly: true } }} />
            </Box>
            <TextField
              label="Delivery address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              fullWidth
              multiline
              minRows={2}
            />
          </Box>

          {/* Payment */}
          <Box sx={{ borderRadius: 4, border: '1px solid var(--ink-200)', bgcolor: '#fff', p: { xs: 1.75, md: 3 } }}>
            <Typography variant="h6" sx={{ fontSize: 17, mb: 0.5 }}>
              Payment method
            </Typography>
            <Typography sx={{ fontSize: 13, color: 'var(--ink-500)', mb: { xs: 1.5, md: 2.5 } }}>
              Online payments are confirmed instantly. Offline modes are verified by our team after payment.
            </Typography>

            <Typography sx={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', color: 'var(--ink-500)', mb: 0.75 }}>
              ONLINE
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 1.25, mb: { xs: 2.5, md: 4 } }}>
              {online.map((m) => (
                <MethodCard key={m.id} id={m.id} label={m.label} description={m.description} />
              ))}
            </Box>
            <Typography sx={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', color: 'var(--ink-500)', mb: 0.75 }}>
              OFFLINE
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.25 }}>
              {offline.map((m) => (
                <MethodCard key={m.id} id={m.id} label={m.label} description={m.description} />
              ))}
            </Box>
          </Box>
        </Box>

        <Box>
          <OrderSummary items={items} />
          <Button
            variant="contained"
            size="large"
            fullWidth
            sx={{ mt: 2 }}
            disabled={placing}
            startIcon={placing ? <CircularProgress size={18} color="inherit" /> : <CheckCircleRoundedIcon />}
            onClick={placeOrder}
          >
            {placing ? 'Placing order…' : `Place order · ${formatMoney(total)}`}
          </Button>
          <Divider sx={{ my: 2 }} />
          <Box className="flex items-start gap-2">
            <ShieldRoundedIcon sx={{ fontSize: 18, color: 'var(--brand-600)', mt: 0.25 }} />
            <Typography sx={{ fontSize: 12.5, color: 'var(--ink-500)' }}>
              Your payment is protected. Invoice and gate pass are generated once the order is confirmed.
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
