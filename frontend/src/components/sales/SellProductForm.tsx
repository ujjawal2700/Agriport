import { useMemo, useState, useRef } from 'react'
import { Box, Typography, TextField, MenuItem, Button, Divider } from '@mui/material'
import { useGetProductsQuery } from '@/redux/api'
import { resolveUnitPrice } from '@/utils/pricing'
import { formatMoney } from '@/utils/format'
import type { Product } from '@/types'
import toast from 'react-hot-toast'
import StockFormDialog from '@/components/executive/StockFormDialog'
import AddRoundedIcon from '@mui/icons-material/AddRounded'

export default function SellProductForm({
  formMode,
}: {
  formMode?: 'sale' | 'purchase' | 'arrival'
}) {
  const isPurchaseOrArrival = formMode === 'purchase' || formMode === 'arrival'
  const { data: products } = useGetProductsQuery()
  const openDialogOnSelectRef = useRef(false)
  const [productId, setProductId] = useState('')
  const [qty, setQty] = useState(1)
  const [price, setPrice] = useState(0)

  const [stockDialogOpen, setStockDialogOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [showSummary, setShowSummary] = useState(false)

  const product = useMemo(() => products?.find((p) => p.id === productId), [products, productId])
  const displayProduct = (selectedProduct && selectedProduct.id === productId) ? selectedProduct : product

  const hasVariants = displayProduct?.sizeVariants && displayProduct.sizeVariants.length > 0

  const slabPrice = displayProduct ? resolveUnitPrice(displayProduct.pricingSlabs, Math.max(qty, displayProduct.moq)).price : 0
  const effectiveQty = displayProduct ? Math.max(qty, displayProduct.moq) : qty
  const unitPrice = price || slabPrice

  const selectProduct = (id: string) => {
    setProductId(id)
    const p = products?.find((x) => x.id === id)
    if (p) {
      setQty(p.moq)
      setPrice(resolveUnitPrice(p.pricingSlabs, p.moq).price)
      setShowSummary(false)
      if (openDialogOnSelectRef.current) {
        setSelectedProduct(p)
        setStockDialogOpen(true)
      }
      openDialogOnSelectRef.current = false
    }
  }

  const handleDialogSave = (savedProduct: Product) => {
    setSelectedProduct(savedProduct)
    setProductId(savedProduct.id)
    setQty(savedProduct.moq)
    setPrice(resolveUnitPrice(savedProduct.pricingSlabs, savedProduct.moq).price)
    setShowSummary(true)
  }

  return (
    <Box className={(isPurchaseOrArrival && !showSummary) ? "flex flex-col gap-6" : "grid grid-cols-1 lg:grid-cols-3 gap-6"}>
      <Box className={(isPurchaseOrArrival && !showSummary) ? "flex flex-col gap-6" : "lg:col-span-2 flex flex-col gap-6"}>


        <Box sx={{ borderRadius: 4, border: '1px solid var(--ink-200)', bgcolor: '#fff', p: 3 }}>
          <Typography sx={{ fontWeight: 700, fontSize: 16, mb: 2 }}>Product & pricing</Typography>
          <Box className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <Box className="sm:col-span-2">
              <TextField
                label="Select product"
                value={productId}
                onChange={(e) => selectProduct(e.target.value)}
                select
                fullWidth
                size="small"
                slotProps={{
                  select: {
                    renderValue: (value) => {
                      const p = products?.find((x) => x.id === value)
                      return p ? p.name : ''
                    }
                  }
                }}
              >
                {products?.map((p) => (
                  <MenuItem key={p.id} value={p.id} sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    {p.name}
                    <AddRoundedIcon
                      sx={{ fontSize: 16, color: '#1C7C58', stroke: '#1C7C58', strokeWidth: 1.5 }}
                      onClick={() => {
                        openDialogOnSelectRef.current = true
                      }}
                    />
                  </MenuItem>
                ))}
              </TextField>
            </Box>

          </Box>
        </Box>
      </Box>

      {/* Summary */}
      {!isPurchaseOrArrival && (
        <Box>
          <Box sx={{ borderRadius: 4, border: '1px solid var(--ink-200)', bgcolor: '#fff', p: 3, position: 'sticky', top: 84 }}>
            <Typography sx={{ fontWeight: 700, fontSize: 16, mb: 2 }}>Sale summary</Typography>
            {displayProduct ? (
              <>
                <Typography sx={{ fontSize: 14, fontWeight: 600 }}>{displayProduct.name}</Typography>
                
                {hasVariants ? (
                  <Box sx={{ mt: 1, mb: 2 }}>
                    {displayProduct?.sizeVariants?.map((v, i) => (
                      <Box key={i} className="flex justify-between" sx={{ py: 0.25 }}>
                        <Typography sx={{ fontSize: 12, color: 'var(--ink-500)' }}>Size {v.size}</Typography>
                        <Typography sx={{ fontSize: 12, fontWeight: 600 }} className="tnum">
                          {v.stock} {displayProduct.unit} × {formatMoney(v.price)}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Typography sx={{ fontSize: 12.5, color: 'var(--ink-500)', mb: 2 }} className="tnum">
                    {effectiveQty} {displayProduct.unit} × {formatMoney(unitPrice)}
                  </Typography>
                )}

                {displayProduct.specifications && (
                  <Box sx={{ mt: 1, mb: 2, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    {displayProduct.specifications['Brand Name'] && (
                      <Box className="flex justify-between">
                        <Typography sx={{ fontSize: 12, color: 'var(--ink-400)' }}>Brand</Typography>
                        <Typography sx={{ fontSize: 12, fontWeight: 600 }}>{displayProduct.specifications['Brand Name']}</Typography>
                      </Box>
                    )}
                    {displayProduct.specifications['Packing Type'] && (
                      <Box className="flex justify-between">
                        <Typography sx={{ fontSize: 12, color: 'var(--ink-400)' }}>Packing</Typography>
                        <Typography sx={{ fontSize: 12, fontWeight: 600 }}>{displayProduct.specifications['Packing Type']}</Typography>
                      </Box>
                    )}
                    {(displayProduct.specifications['Origin'] || displayProduct.origin) && (
                      <Box className="flex justify-between">
                        <Typography sx={{ fontSize: 12, color: 'var(--ink-400)' }}>Origin</Typography>
                        <Typography sx={{ fontSize: 12, fontWeight: 600 }}>
                          {displayProduct.specifications['Origin'] || displayProduct.origin}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                )}


              </>
            ) : (
              <Typography sx={{ fontSize: 13.5, color: 'var(--ink-500)' }}>
                Select a product to build the sale.
              </Typography>
            )}
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
              }}
            >
              {formMode === 'purchase' ? 'Record Purchase' : 'Record Arrival'}
            </Button>
          </Box>
        </Box>
      )}

      {(isPurchaseOrArrival || stockDialogOpen) && (
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
