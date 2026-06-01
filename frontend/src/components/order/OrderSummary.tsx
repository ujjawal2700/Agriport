import { Box, Typography, Divider } from '@mui/material'
import type { CartItem } from '@/types'
import { formatMoney } from '@/utils/format'

export const TAX_RATE = 0.05
export const SHIPPING_FLAT = 1800

export function computeTotals(items: CartItem[]) {
  const subtotal = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0)
  const tax = Math.round(subtotal * TAX_RATE)
  const shipping = subtotal > 0 ? SHIPPING_FLAT : 0
  const total = subtotal + tax + shipping
  return { subtotal, tax, shipping, total }
}

function Row({ label, value, strong, accent }: { label: string; value: string; strong?: boolean; accent?: boolean }) {
  return (
    <Box className="flex items-center justify-between">
      <Typography sx={{ fontSize: strong ? 15 : 14, fontWeight: strong ? 700 : 500, color: strong ? 'var(--ink-900)' : 'var(--ink-600)' }}>
        {label}
      </Typography>
      <Typography
        className="tnum"
        sx={{
          fontSize: strong ? 22 : 14,
          fontWeight: strong ? 800 : 600,
          fontFamily: strong ? '"Bricolage Grotesque", serif' : 'inherit',
          color: accent ? 'var(--brand-700)' : 'var(--ink-900)',
        }}
      >
        {value}
      </Typography>
    </Box>
  )
}

export default function OrderSummary({ items, title = 'Order summary' }: { items: CartItem[]; title?: string }) {
  const { subtotal, tax, shipping, total } = computeTotals(items)
  return (
    <Box sx={{ borderRadius: 4, border: '1px solid var(--ink-200)', bgcolor: '#fff', p: 3 }}>
      <Typography variant="h6" sx={{ fontSize: 17, mb: 2 }}>
        {title}
      </Typography>
      <Box className="flex flex-col gap-2">
        <Row label={`Subtotal (${items.length} items)`} value={formatMoney(subtotal)} />
        <Row label="GST (5%)" value={formatMoney(tax)} />
        <Row label="Shipping & handling" value={formatMoney(shipping)} />
      </Box>
      <Divider sx={{ my: 2 }} />
      <Row label="Total payable" value={formatMoney(total)} strong accent />
    </Box>
  )
}
