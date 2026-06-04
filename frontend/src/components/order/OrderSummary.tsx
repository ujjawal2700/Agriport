import { Box, Typography } from '@mui/material'
import type { CartItem } from '@/types'

export const TAX_RATE = 0.05
export const SHIPPING_FLAT = 1800

export function computeTotals(items: CartItem[]) {
  const subtotal = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0)
  const tax = Math.round(subtotal * TAX_RATE)
  const shipping = subtotal > 0 ? SHIPPING_FLAT : 0
  const total = subtotal + tax + shipping
  return { subtotal, tax, shipping, total }
}

export default function OrderSummary({ items, title = 'Enquiry summary' }: { items: CartItem[]; title?: string }) {
  return (
    <Box sx={{ borderRadius: 4, border: '1px solid var(--ink-200)', bgcolor: '#fff', p: { xs: 2, md: 3 } }}>
      <Typography variant="h6" sx={{ fontSize: 17, mb: 1.5 }}>
        {title}
      </Typography>
      <Box className="flex items-center justify-between">
        <Typography sx={{ fontSize: 14, fontWeight: 500, color: 'var(--ink-600)' }}>
          Total items
        </Typography>
        <Typography sx={{ fontSize: 15, fontWeight: 700, color: 'var(--brand-700)' }}>
          {items.length} {items.length === 1 ? 'item' : 'items'}
        </Typography>
      </Box>
    </Box>
  )
}
