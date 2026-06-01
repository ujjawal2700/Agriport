import { useMemo, useState } from 'react'
import { Box, Typography, TextField, MenuItem, Button, Divider, Chip } from '@mui/material'
import PointOfSaleRoundedIcon from '@mui/icons-material/PointOfSaleRounded'
import QuantityStepper from '@/components/common/QuantityStepper'
import { useGetProductsQuery } from '@/redux/api'
import { resolveUnitPrice, slabSavingsPct } from '@/utils/pricing'
import { formatMoney } from '@/utils/format'
import { PAYMENT_METHODS } from '@/constants'
import type { PaymentMode } from '@/types'
import toast from 'react-hot-toast'

export default function SellProductForm({ onComplete }: { onComplete?: (ref: string) => void }) {
  const { data: products } = useGetProductsQuery()
  const [customer, setCustomer] = useState('')
  const [shop, setShop] = useState('')
  const [phone, setPhone] = useState('')
  const [productId, setProductId] = useState('')
  const [qty, setQty] = useState(1)
  const [price, setPrice] = useState(0)
  const [mode, setMode] = useState<PaymentMode>('upi')

  const product = useMemo(() => products?.find((p) => p.id === productId), [products, productId])
  const slabPrice = product ? resolveUnitPrice(product.pricingSlabs, Math.max(qty, product.moq)).price : 0
  const effectiveQty = product ? Math.max(qty, product.moq) : qty
  const unitPrice = price || slabPrice
  const total = unitPrice * effectiveQty
  const savings = product ? slabSavingsPct(product.pricingSlabs, effectiveQty) : 0

  const selectProduct = (id: string) => {
    setProductId(id)
    const p = products?.find((x) => x.id === id)
    if (p) {
      setQty(p.moq)
      setPrice(resolveUnitPrice(p.pricingSlabs, p.moq).price)
    }
  }

  const valid = customer.trim() && shop.trim() && product && effectiveQty > 0 && unitPrice > 0

  const record = () => {
    const ref = `SL-${Date.now().toString().slice(-6)}`
    toast.success(`Sale ${ref} recorded · ${formatMoney(total)}`)
    onComplete?.(ref)
    setCustomer('')
    setShop('')
    setPhone('')
    setProductId('')
    setQty(1)
    setPrice(0)
  }

  return (
    <Box className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Box className="lg:col-span-2 flex flex-col gap-6">
        <Box sx={{ borderRadius: 4, border: '1px solid var(--ink-200)', bgcolor: '#fff', p: 3 }}>
          <Typography sx={{ fontWeight: 700, fontSize: 16, mb: 2 }}>Customer details</Typography>
          <Box className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <TextField label="Customer name" value={customer} onChange={(e) => setCustomer(e.target.value)} size="small" />
            <TextField label="Shop / company" value={shop} onChange={(e) => setShop(e.target.value)} size="small" />
            <TextField label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} size="small" />
          </Box>
        </Box>

        <Box sx={{ borderRadius: 4, border: '1px solid var(--ink-200)', bgcolor: '#fff', p: 3 }}>
          <Typography sx={{ fontWeight: 700, fontSize: 16, mb: 2 }}>Product & pricing</Typography>
          <Box className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <Box className="sm:col-span-2">
              <TextField label="Select product" value={productId} onChange={(e) => selectProduct(e.target.value)} select fullWidth size="small">
                {products?.map((p) => (
                  <MenuItem key={p.id} value={p.id}>
                    {p.name}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
            {product && (
              <>
                <Box>
                  <Typography sx={{ fontSize: 12.5, color: 'var(--ink-500)', fontWeight: 600, mb: 0.5 }}>
                    QUANTITY (MOQ {product.moq} {product.unit})
                  </Typography>
                  <QuantityStepper value={effectiveQty} onChange={setQty} min={product.moq} max={product.availableStock || undefined} unit={product.unit} size="small" />
                </Box>
                <TextField
                  label="Selling price / unit"
                  type="number"
                  value={unitPrice}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  size="small"
                  helperText={`Suggested lot price: ${formatMoney(slabPrice)}`}
                />
              </>
            )}
          </Box>
        </Box>
      </Box>

      {/* Summary */}
      <Box>
        <Box sx={{ borderRadius: 4, border: '1px solid var(--ink-200)', bgcolor: '#fff', p: 3, position: 'sticky', top: 84 }}>
          <Typography sx={{ fontWeight: 700, fontSize: 16, mb: 2 }}>Sale summary</Typography>
          {product ? (
            <>
              <Typography sx={{ fontSize: 14, fontWeight: 600 }}>{product.name}</Typography>
              <Typography sx={{ fontSize: 12.5, color: 'var(--ink-500)', mb: 2 }} className="tnum">
                {effectiveQty} {product.unit} × {formatMoney(unitPrice)}
              </Typography>
              {savings > 0 && <Chip size="small" color="success" label={`Lot saving ${savings}%`} sx={{ mb: 2 }} />}
              <Divider sx={{ my: 1.5 }} />
              <TextField select label="Payment mode" value={mode} onChange={(e) => setMode(e.target.value as PaymentMode)} fullWidth size="small" sx={{ mb: 2 }}>
                {PAYMENT_METHODS.map((m) => (
                  <MenuItem key={m.id} value={m.id}>
                    {m.label}
                  </MenuItem>
                ))}
              </TextField>
              <Box className="flex justify-between items-baseline mb-3">
                <Typography sx={{ fontWeight: 700 }}>Total</Typography>
                <Typography className="tnum" sx={{ fontFamily: '"Bricolage Grotesque", serif', fontWeight: 800, fontSize: 24, color: 'var(--brand-700)' }}>
                  {formatMoney(total)}
                </Typography>
              </Box>
            </>
          ) : (
            <Typography sx={{ fontSize: 13.5, color: 'var(--ink-500)', mb: 3 }}>
              Select a product to build the sale.
            </Typography>
          )}
          <Button variant="contained" fullWidth size="large" startIcon={<PointOfSaleRoundedIcon />} disabled={!valid} onClick={record}>
            Record sale
          </Button>
        </Box>
      </Box>
    </Box>
  )
}
