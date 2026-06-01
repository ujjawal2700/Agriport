import { useEffect, useState } from 'react'
import { Box, Typography, TextField, Button, Chip, Divider } from '@mui/material'
import AddShoppingCartRoundedIcon from '@mui/icons-material/AddShoppingCartRounded'
import SectionCard from '@/components/common/SectionCard'
import { useGetVendorPurchasesQuery } from '@/redux/api'
import { formatMoney, formatDate } from '@/utils/format'
import type { VendorPurchase } from '@/types'
import toast from 'react-hot-toast'

const STATUS_COLOR: Record<VendorPurchase['status'], 'success' | 'warning' | 'info'> = {
  received: 'success',
  pending: 'warning',
  ordered: 'info',
}

export default function PurchasePage() {
  const { data } = useGetVendorPurchasesQuery()
  const [rows, setRows] = useState<VendorPurchase[]>([])
  const [vendor, setVendor] = useState('')
  const [product, setProduct] = useState('')
  const [qty, setQty] = useState(0)
  const [buyPrice, setBuyPrice] = useState(0)

  useEffect(() => {
    if (data) setRows(data)
  }, [data])

  const total = qty * buyPrice
  const valid = vendor.trim() && product.trim() && qty > 0 && buyPrice > 0

  const record = () => {
    const purchase: VendorPurchase = {
      id: `pu-${Date.now()}`,
      vendor: vendor.trim(),
      product: product.trim(),
      quantity: qty,
      unit: 'unit',
      buyPrice,
      total,
      date: new Date().toISOString(),
      status: 'ordered',
    }
    setRows((prev) => [purchase, ...prev])
    toast.success('Purchase recorded · stock update requested')
    setVendor('')
    setProduct('')
    setQty(0)
    setBuyPrice(0)
  }

  return (
    <Box className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Box>
        <SectionCard title="New purchase" subtitle="Procure stock from a vendor">
          <Box className="flex flex-col gap-3.5">
            <TextField label="Vendor name" value={vendor} onChange={(e) => setVendor(e.target.value)} size="small" />
            <TextField label="Product" value={product} onChange={(e) => setProduct(e.target.value)} size="small" />
            <TextField label="Quantity" type="number" value={qty} onChange={(e) => setQty(Number(e.target.value))} size="small" />
            <TextField label="Buying price / unit (₹)" type="number" value={buyPrice} onChange={(e) => setBuyPrice(Number(e.target.value))} size="small" />
            <Divider />
            <Box className="flex justify-between items-baseline">
              <Typography sx={{ fontWeight: 700 }}>Total</Typography>
              <Typography className="tnum" sx={{ fontFamily: '"Bricolage Grotesque", serif', fontWeight: 800, fontSize: 22, color: 'var(--brand-700)' }}>
                {formatMoney(total)}
              </Typography>
            </Box>
            <Button variant="contained" startIcon={<AddShoppingCartRoundedIcon />} disabled={!valid} onClick={record}>
              Record purchase
            </Button>
          </Box>
        </SectionCard>
      </Box>

      <Box className="lg:col-span-2">
        <SectionCard title="Purchase history" padded={false}>
          <Box sx={{ px: 3, pb: 1 }}>
            {rows.map((p, i) => (
              <Box
                key={p.id}
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr auto', sm: '1.4fr 1fr 1fr auto' },
                  alignItems: 'center',
                  gap: 1.5,
                  py: 1.75,
                  borderTop: i === 0 ? 'none' : '1px solid var(--ink-100)',
                }}
              >
                <Box>
                  <Typography sx={{ fontWeight: 600, fontSize: 13.5 }}>{p.product}</Typography>
                  <Typography sx={{ fontSize: 12, color: 'var(--ink-500)' }}>{p.vendor} · {formatDate(p.date)}</Typography>
                </Box>
                <Typography className="tnum" sx={{ fontSize: 13, color: 'var(--ink-600)', display: { xs: 'none', sm: 'block' } }}>
                  {p.quantity} {p.unit} × {formatMoney(p.buyPrice)}
                </Typography>
                <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                  <Chip size="small" label={p.status} color={STATUS_COLOR[p.status]} variant="outlined" />
                </Box>
                <Typography className="tnum" sx={{ fontWeight: 700, fontSize: 14, textAlign: 'right' }}>{formatMoney(p.total)}</Typography>
              </Box>
            ))}
          </Box>
        </SectionCard>
      </Box>
    </Box>
  )
}
