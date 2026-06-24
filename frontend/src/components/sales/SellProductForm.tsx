import { useMemo, useState } from 'react'
import { Box, Typography, Button, Divider } from '@mui/material'
import { useGetProductsQuery, useCreateVendorPurchaseMutation, useCreateStockRequestMutation, useCreateOrderMutation } from '@/redux/api'
import { resolveUnitPrice } from '@/utils/pricing'
import { formatMoney } from '@/utils/format'
import type { Product, PurchaseDraft, ArrivalDraft, SaleDraft } from '@/types'
import toast from 'react-hot-toast'
import StockFormDialog from '@/components/executive/StockFormDialog'
import AddRoundedIcon from '@mui/icons-material/AddRounded'

export default function SellProductForm({
  formMode,
}: {
  formMode?: 'sale' | 'purchase' | 'arrival'
}) {
  const isPurchaseOrArrival = formMode === 'purchase' || formMode === 'arrival'
  const { data: products } = useGetProductsQuery({ isExecutive: true })

  const [productId, setProductId] = useState('')
  const [qty, setQty] = useState(1)
  const [price, setPrice] = useState(0)

  const [stockDialogOpen, setStockDialogOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [showSummary, setShowSummary] = useState(false)

  const [purchaseDraft, setPurchaseDraft] = useState<PurchaseDraft | null>(null)
  const [createVendorPurchase, { isLoading: isCreatingPurchase }] = useCreateVendorPurchaseMutation()

  const handlePurchaseDialogSave = (draft: PurchaseDraft) => {
    setPurchaseDraft(draft)
    setShowSummary(true)
  }

  const [arrivalDraft, setArrivalDraft] = useState<ArrivalDraft | null>(null)
  const [createStockRequest, { isLoading: isCreatingRequest }] = useCreateStockRequestMutation()

  const handleArrivalDialogSave = (draft: ArrivalDraft) => {
    setArrivalDraft(draft)
    setShowSummary(true)
  }

  const [saleDraft, setSaleDraft] = useState<SaleDraft | null>(null)
  const [createOrder, { isLoading: isCreatingOrder }] = useCreateOrderMutation()

  const handleSaleDialogSave = (draft: SaleDraft) => {
    setSaleDraft(draft)
    setShowSummary(true)
  }

  const product = useMemo(() => products?.find((p) => p.id === productId), [products, productId])
  const displayProduct = (selectedProduct && selectedProduct.id === productId) ? selectedProduct : product

  const hasVariants = displayProduct?.sizeVariants && displayProduct.sizeVariants.length > 0

  const slabPrice = displayProduct ? resolveUnitPrice(displayProduct.pricingSlabs, Math.max(qty, displayProduct.moq)).price : 0
  const effectiveQty = displayProduct ? Math.max(qty, displayProduct.moq) : qty
  const unitPrice = price || slabPrice


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
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography sx={{ fontWeight: 700, fontSize: 16 }}>
              {formMode === 'purchase' ? 'Purchase configuration' : formMode === 'arrival' ? 'Arrival configuration' : 'Product & pricing'}
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddRoundedIcon />}
              onClick={() => {
                setSelectedProduct(null)
                setStockDialogOpen(true)
              }}
              sx={{
                bgcolor: '#1C7C58',
                '&:hover': { bgcolor: '#155f44' },
                fontWeight: 600,
                textTransform: 'none',
                borderRadius: 2,
                px: 2.5,
                fontSize: 13.5,
                boxShadow: 'none',
              }}
            >
              {(formMode === 'purchase' && purchaseDraft) || (formMode === 'arrival' && arrivalDraft) || (formMode === 'sale' && saleDraft) ? 'Change' : 'Add'}
            </Button>
          </Box>

          {formMode === 'purchase' && purchaseDraft ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Box>
                  <Typography sx={{ fontSize: 12, color: 'var(--ink-400)', fontWeight: 600 }}>VENDOR</Typography>
                  <Typography sx={{ fontSize: 14, fontWeight: 600 }}>{purchaseDraft.vendorName}</Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontSize: 12, color: 'var(--ink-400)', fontWeight: 600 }}>PRODUCT</Typography>
                  <Typography sx={{ fontSize: 14, fontWeight: 600 }}>{purchaseDraft.productName}</Typography>
                </Box>
              </Box>
              <Box className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Box>
                  <Typography sx={{ fontSize: 12, color: 'var(--ink-400)', fontWeight: 600 }}>QUANTITY</Typography>
                  <Typography sx={{ fontSize: 14, fontWeight: 600 }} className="tnum">
                    {purchaseDraft.quantity} {purchaseDraft.unit}
                  </Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontSize: 12, color: 'var(--ink-400)', fontWeight: 600 }}>UNIT PRICE</Typography>
                  <Typography sx={{ fontSize: 14, fontWeight: 600 }} className="tnum">
                    {formatMoney(purchaseDraft.buyPrice)}
                  </Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontSize: 12, color: 'var(--ink-400)', fontWeight: 600 }}>TOTAL VALUE</Typography>
                  <Typography sx={{ fontSize: 14, fontWeight: 600, color: 'var(--brand-600)' }} className="tnum">
                    {formatMoney(purchaseDraft.quantity * purchaseDraft.buyPrice)}
                  </Typography>
                </Box>
              </Box>
              <Box className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Box>
                  <Typography sx={{ fontSize: 12, color: 'var(--ink-400)', fontWeight: 600 }}>DATE</Typography>
                  <Typography sx={{ fontSize: 14, fontWeight: 600 }}>
                    {new Date(purchaseDraft.purchaseDate).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontSize: 12, color: 'var(--ink-400)', fontWeight: 600 }}>STATUS</Typography>
                  <Typography
                    sx={{
                      fontSize: 12,
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      color:
                        purchaseDraft.status === 'received'
                          ? '#1C7C58'
                          : purchaseDraft.status === 'ordered'
                          ? '#3498db'
                          : '#f39c12',
                    }}
                  >
                    {purchaseDraft.status}
                  </Typography>
                </Box>
              </Box>
              {purchaseDraft.notes && (
                <Box>
                  <Typography sx={{ fontSize: 12, color: 'var(--ink-400)', fontWeight: 600 }}>NOTES</Typography>
                  <Typography sx={{ fontSize: 13, color: 'var(--ink-600)', fontStyle: 'italic' }}>
                    {purchaseDraft.notes}
                  </Typography>
                </Box>
              )}
            </Box>
          ) : formMode === 'arrival' && arrivalDraft ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Box>
                  <Typography sx={{ fontSize: 12, color: 'var(--ink-400)', fontWeight: 600 }}>PRODUCT</Typography>
                  <Typography sx={{ fontSize: 14, fontWeight: 600 }}>{arrivalDraft.productName}</Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontSize: 12, color: 'var(--ink-400)', fontWeight: 600 }}>CATEGORY</Typography>
                  <Typography sx={{ fontSize: 14, fontWeight: 600 }}>{arrivalDraft.category}</Typography>
                </Box>
              </Box>
              <Box className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Box>
                  <Typography sx={{ fontSize: 12, color: 'var(--ink-400)', fontWeight: 600 }}>CURRENT STOCK</Typography>
                  <Typography sx={{ fontSize: 14, fontWeight: 600 }} className="tnum">
                    {arrivalDraft.currentStock}
                  </Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontSize: 12, color: 'var(--ink-400)', fontWeight: 600 }}>ARRIVING QUANTITY</Typography>
                  <Typography sx={{ fontSize: 14, fontWeight: 600 }} className="tnum">
                    {arrivalDraft.requestedChange}
                  </Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontSize: 12, color: 'var(--ink-400)', fontWeight: 600 }}>EXPECTED NEW STOCK</Typography>
                  <Typography sx={{ fontSize: 14, fontWeight: 600, color: 'var(--brand-600)' }} className="tnum">
                    {arrivalDraft.type === 'add'
                      ? arrivalDraft.currentStock + arrivalDraft.requestedChange
                      : arrivalDraft.requestedChange}
                  </Typography>
                </Box>
              </Box>
              <Box className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Box>
                  <Typography sx={{ fontSize: 12, color: 'var(--ink-400)', fontWeight: 600 }}>REQUEST TYPE</Typography>
                  <Typography sx={{ fontSize: 14, fontWeight: 600, textTransform: 'uppercase' }}>
                    {arrivalDraft.type === 'add' ? 'Add to Stock' : 'Overwrite Stock'}
                  </Typography>
                </Box>
              </Box>
              {arrivalDraft.notes && (
                <Box>
                  <Typography sx={{ fontSize: 12, color: 'var(--ink-400)', fontWeight: 600 }}>NOTES</Typography>
                  <Typography sx={{ fontSize: 13, color: 'var(--ink-600)', fontStyle: 'italic' }}>
                    {arrivalDraft.notes}
                  </Typography>
                </Box>
              )}
            </Box>
          ) : formMode === 'sale' && saleDraft ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Box>
                  <Typography sx={{ fontSize: 12, color: 'var(--ink-400)', fontWeight: 600 }}>CUSTOMER</Typography>
                  <Typography sx={{ fontSize: 14, fontWeight: 600 }}>{saleDraft.customerName}</Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontSize: 12, color: 'var(--ink-400)', fontWeight: 600 }}>PRODUCT</Typography>
                  <Typography sx={{ fontSize: 14, fontWeight: 600 }}>{saleDraft.productName}</Typography>
                </Box>
              </Box>
              <Box className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Box>
                  <Typography sx={{ fontSize: 12, color: 'var(--ink-400)', fontWeight: 600 }}>QUANTITY</Typography>
                  <Typography sx={{ fontSize: 14, fontWeight: 600 }} className="tnum">
                    {saleDraft.quantity} {saleDraft.unit}
                  </Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontSize: 12, color: 'var(--ink-400)', fontWeight: 600 }}>QUOTED PRICE</Typography>
                  <Typography sx={{ fontSize: 14, fontWeight: 600 }} className="tnum">
                    {formatMoney(saleDraft.unitPrice)}
                  </Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontSize: 12, color: 'var(--ink-400)', fontWeight: 600 }}>SUBTOTAL</Typography>
                  <Typography sx={{ fontSize: 14, fontWeight: 600, color: 'var(--brand-600)' }} className="tnum">
                    {formatMoney(saleDraft.quantity * saleDraft.unitPrice)}
                  </Typography>
                </Box>
              </Box>
              <Box className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Box>
                  <Typography sx={{ fontSize: 12, color: 'var(--ink-400)', fontWeight: 600 }}>DELIVERY ADDRESS</Typography>
                  <Typography sx={{ fontSize: 14, fontWeight: 600 }}>{saleDraft.deliveryAddress}</Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontSize: 12, color: 'var(--ink-400)', fontWeight: 600 }}>PAYMENT MODE</Typography>
                  <Typography sx={{ fontSize: 14, fontWeight: 600, textTransform: 'capitalize' }}>
                    {saleDraft.paymentMode}
                  </Typography>
                </Box>
              </Box>
              {saleDraft.notes && (
                <Box>
                  <Typography sx={{ fontSize: 12, color: 'var(--ink-400)', fontWeight: 600 }}>NOTES</Typography>
                  <Typography sx={{ fontSize: 13, color: 'var(--ink-600)', fontStyle: 'italic' }}>
                    {saleDraft.notes}
                  </Typography>
                </Box>
              )}
            </Box>
          ) : (
            <Box
              sx={{
                border: '1.5px dashed var(--ink-200)',
                borderRadius: 3,
                py: 5,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1,
                bgcolor: '#fafafa',
              }}
            >
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  bgcolor: 'rgba(28,124,88,0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 0.5,
                }}
              >
                <AddRoundedIcon sx={{ color: '#1C7C58', fontSize: 24 }} />
              </Box>
              <Typography sx={{ fontWeight: 600, fontSize: 14, color: 'var(--ink-700)' }}>
                No product added yet
              </Typography>
              <Typography sx={{ fontSize: 12.5, color: 'var(--ink-400)', textAlign: 'center' }}>
                {formMode === 'purchase'
                  ? 'Click "Add" to configure vendor purchase details'
                  : formMode === 'sale'
                  ? 'Click "Add" to configure portfolio customer sale details'
                  : 'Click "Add Product" to select and configure a product'}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

      {/* Summary */}
      {formMode !== 'sale' && !isPurchaseOrArrival && (
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

      {formMode === 'purchase' && showSummary && purchaseDraft && (
        <Box>
          <Box sx={{ borderRadius: 4, border: '1px solid var(--ink-200)', bgcolor: '#fff', p: 3, position: 'sticky', top: 84 }}>
            <Typography sx={{ fontWeight: 700, fontSize: 16, mb: 2 }}>Purchase summary</Typography>
            
            <Typography sx={{ fontSize: 14, fontWeight: 600, mb: 1 }}>{purchaseDraft.productName}</Typography>
            
            <Box className="flex flex-col gap-2 mb-3">
              <Box className="flex justify-between">
                <Typography sx={{ fontSize: 12.5, color: 'var(--ink-50)' }}>Vendor</Typography>
                <Typography sx={{ fontSize: 12.5, fontWeight: 600 }}>{purchaseDraft.vendorName}</Typography>
              </Box>
              <Box className="flex justify-between">
                <Typography sx={{ fontSize: 12.5, color: 'var(--ink-500)' }}>Quantity</Typography>
                <Typography sx={{ fontSize: 12.5, fontWeight: 600 }} className="tnum">
                  {purchaseDraft.quantity} {purchaseDraft.unit}
                </Typography>
              </Box>
              <Box className="flex justify-between">
                <Typography sx={{ fontSize: 12.5, color: 'var(--ink-500)' }}>Unit Price</Typography>
                <Typography sx={{ fontSize: 12.5, fontWeight: 600 }} className="tnum">
                  {formatMoney(purchaseDraft.buyPrice)}
                </Typography>
              </Box>
              <Box className="flex justify-between">
                <Typography sx={{ fontSize: 12.5, color: 'var(--ink-500)' }}>Total Cost</Typography>
                <Typography sx={{ fontSize: 13, fontWeight: 700, color: 'var(--brand-600)' }} className="tnum">
                  {formatMoney(purchaseDraft.quantity * purchaseDraft.buyPrice)}
                </Typography>
              </Box>
              <Box className="flex justify-between">
                <Typography sx={{ fontSize: 12.5, color: 'var(--ink-500)' }}>Status</Typography>
                <Typography sx={{ fontSize: 12.5, fontWeight: 600, textTransform: 'capitalize' }}>
                  {purchaseDraft.status}
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Button
              variant="contained"
              fullWidth
              size="large"
              disabled={isCreatingPurchase}
              onClick={async () => {
                try {
                  const res = await createVendorPurchase({
                    vendorName: purchaseDraft.vendorName,
                    productId: purchaseDraft.productId,
                    quantity: purchaseDraft.quantity,
                    unit: purchaseDraft.unit,
                    buyPrice: purchaseDraft.buyPrice,
                    purchaseDate: purchaseDraft.purchaseDate,
                    status: purchaseDraft.status,
                    notes: purchaseDraft.notes,
                    specifications: purchaseDraft.specifications,
                  }).unwrap()

                  toast.success(`Purchase logged successfully! Ref: ${res.data?._id?.slice(-6) || ''}`)
                  
                  // Reset states
                  setPurchaseDraft(null)
                  setShowSummary(false)
                } catch (err: any) {
                  toast.error(err.data?.message || 'Failed to record purchase')
                }
              }}
            >
              {isCreatingPurchase ? 'Recording...' : 'Record Purchase'}
            </Button>
          </Box>
        </Box>
      )}

      {formMode === 'arrival' && showSummary && arrivalDraft && (
        <Box>
          <Box sx={{ borderRadius: 4, border: '1px solid var(--ink-200)', bgcolor: '#fff', p: 3, position: 'sticky', top: 84 }}>
            <Typography sx={{ fontWeight: 700, fontSize: 16, mb: 2 }}>Arrival summary</Typography>
            
            <Typography sx={{ fontSize: 14, fontWeight: 600, mb: 1 }}>{arrivalDraft.productName}</Typography>
            
            <Box className="flex flex-col gap-2 mb-3">
              <Box className="flex justify-between">
                <Typography sx={{ fontSize: 12.5, color: 'var(--ink-500)' }}>Category</Typography>
                <Typography sx={{ fontSize: 12.5, fontWeight: 600 }}>{arrivalDraft.category}</Typography>
              </Box>
              <Box className="flex justify-between">
                <Typography sx={{ fontSize: 12.5, color: 'var(--ink-500)' }}>Current Stock</Typography>
                <Typography sx={{ fontSize: 12.5, fontWeight: 600 }} className="tnum">
                  {arrivalDraft.currentStock}
                </Typography>
              </Box>
              <Box className="flex justify-between">
                <Typography sx={{ fontSize: 12.5, color: 'var(--ink-500)' }}>Quantity Arriving</Typography>
                <Typography sx={{ fontSize: 12.5, fontWeight: 600 }} className="tnum">
                  + {arrivalDraft.requestedChange}
                </Typography>
              </Box>
              <Box className="flex justify-between">
                <Typography sx={{ fontSize: 12.5, color: 'var(--ink-500)' }}>Adjustment Type</Typography>
                <Typography sx={{ fontSize: 12.5, fontWeight: 600, textTransform: 'capitalize' }}>
                  {arrivalDraft.type === 'add' ? 'Add' : 'Overwrite'}
                </Typography>
              </Box>
              <Box className="flex justify-between">
                <Typography sx={{ fontSize: 12.5, color: 'var(--ink-500)' }}>Expected New Stock</Typography>
                <Typography sx={{ fontSize: 13, fontWeight: 700, color: 'var(--brand-600)' }} className="tnum">
                  {arrivalDraft.type === 'add'
                    ? arrivalDraft.currentStock + arrivalDraft.requestedChange
                    : arrivalDraft.requestedChange}
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Button
              variant="contained"
              fullWidth
              size="large"
              disabled={isCreatingRequest}
              onClick={async () => {
                try {
                  await createStockRequest({
                    productId: arrivalDraft.productId,
                    type: arrivalDraft.type,
                    requestedChange: arrivalDraft.requestedChange,
                    notes: arrivalDraft.notes,
                    specifications: arrivalDraft.specifications,
                  }).unwrap()

                  toast.success('Stock arrival request raised successfully!')
                  
                  // Reset states
                  setArrivalDraft(null)
                  setShowSummary(false)
                } catch (err: any) {
                  toast.error(err.data?.message || 'Failed to raise stock request')
                }
              }}
            >
              {isCreatingRequest ? 'Submitting...' : 'Record Arrival'}
            </Button>
          </Box>
        </Box>
      )}

      {formMode === 'sale' && showSummary && saleDraft && (
        <Box>
          <Box sx={{ borderRadius: 4, border: '1px solid var(--ink-200)', bgcolor: '#fff', p: 3, position: 'sticky', top: 84 }}>
            <Typography sx={{ fontWeight: 700, fontSize: 16, mb: 2 }}>Sale summary</Typography>
            
            <Typography sx={{ fontSize: 14, fontWeight: 600, mb: 1 }}>{saleDraft.productName}</Typography>
            
            <Box className="flex flex-col gap-2 mb-3">
              <Box className="flex justify-between">
                <Typography sx={{ fontSize: 12.5, color: 'var(--ink-500)' }}>Customer</Typography>
                <Typography sx={{ fontSize: 12.5, fontWeight: 600 }}>{saleDraft.customerName}</Typography>
              </Box>
              <Box className="flex justify-between">
                <Typography sx={{ fontSize: 12.5, color: 'var(--ink-500)' }}>Quantity</Typography>
                <Typography sx={{ fontSize: 12.5, fontWeight: 600 }} className="tnum">
                  {saleDraft.quantity} {saleDraft.unit}
                </Typography>
              </Box>
              <Box className="flex justify-between">
                <Typography sx={{ fontSize: 12.5, color: 'var(--ink-500)' }}>Unit Price</Typography>
                <Typography sx={{ fontSize: 12.5, fontWeight: 600 }} className="tnum">
                  {formatMoney(saleDraft.unitPrice)}
                </Typography>
              </Box>
              <Box className="flex justify-between">
                <Typography sx={{ fontSize: 12.5, color: 'var(--ink-500)' }}>Subtotal</Typography>
                <Typography sx={{ fontSize: 12.5, fontWeight: 600 }} className="tnum">
                  {formatMoney(saleDraft.quantity * saleDraft.unitPrice)}
                </Typography>
              </Box>
              <Box className="flex justify-between">
                <Typography sx={{ fontSize: 12.5, color: 'var(--ink-500)' }}>GST (5%)</Typography>
                <Typography sx={{ fontSize: 12.5, fontWeight: 600 }} className="tnum">
                  {formatMoney(Math.round(saleDraft.quantity * saleDraft.unitPrice * 0.05 * 100) / 100)}
                </Typography>
              </Box>
              <Box className="flex justify-between">
                <Typography sx={{ fontSize: 12.5, color: 'var(--ink-500)' }}>Shipping</Typography>
                <Typography sx={{ fontSize: 12.5, fontWeight: 600 }} className="tnum">
                  {saleDraft.quantity * saleDraft.unitPrice >= 50000 ? 'Free' : formatMoney(1500)}
                </Typography>
              </Box>
              <Box className="flex justify-between">
                <Typography sx={{ fontSize: 12.5, color: 'var(--ink-500)' }}>Payment Mode</Typography>
                <Typography sx={{ fontSize: 12.5, fontWeight: 600, textTransform: 'capitalize' }}>
                  {saleDraft.paymentMode}
                </Typography>
              </Box>
              <Box className="flex justify-between">
                <Typography sx={{ fontSize: 12.5, color: 'var(--ink-500)' }}>Grand Total</Typography>
                <Typography sx={{ fontSize: 13, fontWeight: 700, color: 'var(--brand-600)' }} className="tnum">
                  {formatMoney(
                    saleDraft.quantity * saleDraft.unitPrice +
                    Math.round(saleDraft.quantity * saleDraft.unitPrice * 0.05 * 100) / 100 +
                    (saleDraft.quantity * saleDraft.unitPrice >= 50000 ? 0 : 1500)
                  )}
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Button
              variant="contained"
              fullWidth
              size="large"
              disabled={isCreatingOrder}
              onClick={async () => {
                const subtotal = saleDraft.quantity * saleDraft.unitPrice
                const shipping = subtotal >= 50000 ? 0 : 1500
                try {
                  const res = await createOrder({
                    customerId: saleDraft.customerId,
                    lines: [
                      {
                        productId: saleDraft.productId,
                        quantity: saleDraft.quantity,
                        unit: saleDraft.unit,
                      },
                    ],
                    paymentMode: saleDraft.paymentMode,
                    deliveryAddress: saleDraft.deliveryAddress,
                    quotedPrices: {
                      [saleDraft.productId]: saleDraft.unitPrice,
                    },
                    quotedShipping: shipping,
                  }).unwrap()

                  toast.success(`Sale recorded successfully! Order Ref: ${res.data?.reference || ''}`)
                  
                  // Reset states
                  setSaleDraft(null)
                  setShowSummary(false)
                } catch (err: any) {
                  toast.error(err.data?.message || 'Failed to record sale')
                }
              }}
            >
              {isCreatingOrder ? 'Recording...' : 'Record Sale'}
            </Button>
          </Box>
        </Box>
      )}

      {(isPurchaseOrArrival || formMode === 'sale' || stockDialogOpen) && (
        <StockFormDialog
          open={stockDialogOpen}
          onClose={() => setStockDialogOpen(false)}
          productToEdit={selectedProduct}
          onSave={handleDialogSave}
          onSavePurchase={handlePurchaseDialogSave}
          onSaveArrival={handleArrivalDialogSave}
          onSaveSale={handleSaleDialogSave}
          formMode={formMode}
        />
      )}
    </Box>
  )
}
