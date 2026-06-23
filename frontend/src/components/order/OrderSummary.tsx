import { Box, Typography, Divider } from '@mui/material'
import type { CartItem } from '@/types'
import { formatMoney } from '@/utils/format'

export const TAX_RATE = 0.05

export function computeTotals(items: CartItem[]) {
  const subtotal = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0)
  const tax = Math.round(subtotal * TAX_RATE)
  const shipping = subtotal >= 50000 ? 0 : subtotal > 0 ? 1500 : 0
  const total = subtotal + tax + shipping
  return { subtotal, tax, shipping, total }
}

export default function OrderSummary({ items, title = 'Enquiry summary' }: { items: CartItem[]; title?: string }) {
  const { subtotal, tax, shipping, total } = computeTotals(items)

  return (
    <Box sx={{ borderRadius: 4, border: '1px solid var(--ink-200)', bgcolor: '#fff', p: { xs: 2.5, md: 3 } }}>
      <Typography variant="h6" sx={{ fontSize: 17, fontWeight: 700, mb: 2 }}>
        {title}
      </Typography>
      
      <Box className="flex flex-col gap-2.5">
        <Box className="flex items-center justify-between">
          <Typography sx={{ fontSize: 13.5, color: 'var(--ink-500)' }}>
            Total items
          </Typography>
          <Typography sx={{ fontSize: 14, fontWeight: 600, color: 'var(--ink-800)' }}>
            {items.length} {items.length === 1 ? 'item' : 'items'}
          </Typography>
        </Box>

        <Box className="flex items-center justify-between">
          <Typography sx={{ fontSize: 13.5, color: 'var(--ink-500)' }}>
            Subtotal
          </Typography>
          <Typography className="tnum" sx={{ fontSize: 14, fontWeight: 600, color: 'var(--ink-800)' }}>
            {formatMoney(subtotal)}
          </Typography>
        </Box>

        <Box className="flex items-center justify-between">
          <Typography sx={{ fontSize: 13.5, color: 'var(--ink-500)' }}>
            GST (5%)
          </Typography>
          <Typography className="tnum" sx={{ fontSize: 14, fontWeight: 600, color: 'var(--ink-800)' }}>
            {formatMoney(tax)}
          </Typography>
        </Box>

        <Box className="flex items-center justify-between">
          <Typography sx={{ fontSize: 13.5, color: 'var(--ink-500)' }}>
            Shipping Fee
          </Typography>
          {shipping === 0 ? (
            <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: 'var(--brand-600)' }}>
              Free
            </Typography>
          ) : (
            <Typography className="tnum" sx={{ fontSize: 14, fontWeight: 600, color: 'var(--ink-800)' }}>
              {formatMoney(shipping)}
            </Typography>
          )}
        </Box>

        {shipping > 0 && (
          <Typography sx={{ fontSize: 11, color: 'var(--ink-400)', textAlign: 'right', mt: -0.5 }}>
            Add {formatMoney(50000 - subtotal)} more for Free Shipping
          </Typography>
        )}

        <Divider sx={{ my: 1 }} />

        <Box className="flex items-center justify-between">
          <Typography sx={{ fontSize: 15, fontWeight: 700, color: 'var(--ink-900)' }}>
            Grand Total
          </Typography>
          <Typography className="tnum" sx={{ fontSize: 18, fontWeight: 800, color: 'var(--brand-700)', fontFamily: '"Bricolage Grotesque", serif' }}>
            {formatMoney(total)}
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}

