import { useMemo, useState } from 'react'
import { Box, Typography, TextField, MenuItem, Button, Divider, Chip } from '@mui/material'
import PointOfSaleRoundedIcon from '@mui/icons-material/PointOfSaleRounded'
import QuantityStepper from '@/components/common/QuantityStepper'
import { useGetProductsQuery } from '@/redux/api'
import { resolveUnitPrice, slabSavingsPct } from '@/utils/pricing'
import { formatMoney } from '@/utils/format'
import { PAYMENT_METHODS } from '@/constants'
import type { PaymentMode, Product } from '@/types'
import toast from 'react-hot-toast'
import StockFormDialog from '@/components/executive/StockFormDialog'

export default function SellProductForm({
  onComplete,
  formMode,
}: {
  onComplete?: (ref: string) => void
  formMode?: 'sale' | 'purchase' | 'arrival'
}) {
  const isPurchaseOrArrival = formMode === 'purchase' || formMode === 'arrival'
  const { data: products } = useGetProductsQuery()
  const [customer, setCustomer] = useState('')
  const [shop, setShop] = useState('')
  const [phone, setPhone] = useState('')
  const [productId, setProductId] = useState('')
  const [qty, setQty] = useState(1)
  const [price, setPrice] = useState(0)
  const [mode, setMode] = useState<PaymentMode>('upi')

  const [stockDialogOpen, setStockDialogOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [showSummary, setShowSummary] = useState(false)

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
      setShowSummary(false)
      if (isPurchaseOrArrival) {
        setSelectedProduct(p)
        setStockDialogOpen(true)
      }
    }
  }

  const handleDialogSave = (savedProduct: Product) => {
    setSelectedProduct(savedProduct)
    setProductId(savedProduct.id)
    setQty(savedProduct.moq)
    setPrice(resolveUnitPrice(savedProduct.pricingSlabs, savedProduct.moq).price)
    setShowSummary(true)
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
    <Box className={(isPurchaseOrArrival && !showSummary) ? "flex flex-col gap-6" : "grid grid-cols-1 lg:grid-cols-3 gap-6"}>
      <Box className={(isPurchaseOrArrival && !showSummary) ? "flex flex-col gap-6" : "lg:col-span-2 flex flex-col gap-6"}>
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
            {product && !isPurchaseOrArrival && (
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
      {!isPurchaseOrArrival && (
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
      )}

      {isPurchaseOrArrival && showSummary && product && (
        <Box>
          <Box sx={{ borderRadius: 4, border: '1px solid var(--ink-200)', bgcolor: '#fff', p: 3, position: 'sticky', top: 84 }}>
            <Typography sx={{ fontWeight: 700, fontSize: 16, mb: 2 }}>
              {formMode === 'purchase' ? 'Purchase summary' : 'Arrival summary'}
            </Typography>
            
            <Typography sx={{ fontSize: 14, fontWeight: 600, mb: 1 }}>{product.name}</Typography>
            
            <Box className="flex flex-col gap-2 mb-3">
              <Box className="flex justify-between">
                <Typography sx={{ fontSize: 12.5, color: 'var(--ink-500)' }}>Category</Typography>
                <Typography sx={{ fontSize: 12.5, fontWeight: 600 }}>{product.category}</Typography>
              </Box>
              <Box className="flex justify-between">
                <Typography sx={{ fontSize: 12.5, color: 'var(--ink-500)' }}>Available Stock</Typography>
                <Typography sx={{ fontSize: 12.5, fontWeight: 600 }} className="tnum">
                  {product.availableStock.toLocaleString('en-IN')} {product.unit}
                </Typography>
              </Box>
              <Box className="flex justify-between">
                <Typography sx={{ fontSize: 12.5, color: 'var(--ink-500)' }}>Base Price</Typography>
                <Typography sx={{ fontSize: 12.5, fontWeight: 600 }} className="tnum">
                  {formatMoney(product.basePrice)} / {product.unit}
                </Typography>
              </Box>
              {product.sizeVariants && product.sizeVariants.length > 0 && (
                <Box sx={{ mt: 1 }}>
                  <Typography sx={{ fontSize: 11.5, color: 'var(--ink-400)', fontWeight: 700, textTransform: 'uppercase', mb: 0.5 }}>
                    Variants Added
                  </Typography>
                  {product.sizeVariants.map((v, i) => (
                    <Box key={i} className="flex justify-between" sx={{ py: 0.25 }}>
                      <Typography sx={{ fontSize: 12, color: 'var(--ink-500)' }}>Size {v.size}</Typography>
                      <Typography sx={{ fontSize: 12, fontWeight: 600 }} className="tnum">
                        {v.stock} {product.unit} @ {formatMoney(v.price)}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>

            <Divider sx={{ my: 2 }} />

            <Button
              variant="contained"
              fullWidth
              size="large"
              onClick={() => {
                const ref = formMode === 'purchase' ? `PR-${Date.now().toString().slice(-6)}` : `AR-${Date.now().toString().slice(-6)}`
                toast.success(
                  formMode === 'purchase'
                    ? `Purchase ${ref} recorded successfully!`
                    : `Arrival ${ref} recorded successfully!`
                )
                setProductId('')
                setSelectedProduct(null)
                setShowSummary(false)
                setCustomer('')
                setShop('')
                setPhone('')
              }}
            >
              {formMode === 'purchase' ? 'Record Purchase' : 'Record Arrival'}
            </Button>
          </Box>
        </Box>
      )}

      {isPurchaseOrArrival && (
        <StockFormDialog
          open={stockDialogOpen}
          onClose={() => setStockDialogOpen(false)}
          productToEdit={selectedProduct}
          onSave={handleDialogSave}
          formMode={formMode}
        />
      )}
    </Box>
  )
}
