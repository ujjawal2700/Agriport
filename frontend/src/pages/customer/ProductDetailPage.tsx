import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box,
  Typography,
  Button,
  Chip,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableRow,
} from '@mui/material'
import StarRoundedIcon from '@mui/icons-material/StarRounded'
import ShoppingCartRoundedIcon from '@mui/icons-material/ShoppingCartRounded'
import BoltRoundedIcon from '@mui/icons-material/BoltRounded'
import LocalShippingRoundedIcon from '@mui/icons-material/LocalShippingRounded'
import PublicRoundedIcon from '@mui/icons-material/PublicRounded'
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded'
import { useGetProductQuery } from '@/redux/api'
import { useAppDispatch } from '@/redux/hooks'
import { addToCart } from '@/redux/slices/cartSlice'
import ProductThumb from '@/components/common/ProductThumb'
import StatusChip from '@/components/common/StatusChip'
import QuantityStepper from '@/components/common/QuantityStepper'
import PageHeader from '@/components/common/PageHeader'
import { Loader } from '@/components/common/Loader'
import EmptyState from '@/components/common/EmptyState'
import { formatMoney } from '@/utils/format'
import { resolveUnitPrice, slabSavingsPct } from '@/utils/pricing'
import { ROUTES } from '@/constants'
import toast from 'react-hot-toast'

export default function ProductDetailPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { data: product, isLoading } = useGetProductQuery(id)
  const [activeImg, setActiveImg] = useState(0)
  const [qty, setQty] = useState(1)

  if (isLoading) return <Loader height={400} />
  if (!product)
    return (
      <EmptyState title="Product not found" actionLabel="Back to marketplace" onAction={() => navigate(ROUTES.products)} />
    )

  // Initialise qty to MOQ on first resolve
  const effectiveQty = Math.max(qty, product.moq)
  const currentSlab = resolveUnitPrice(product.pricingSlabs, effectiveQty)
  const savings = slabSavingsPct(product.pricingSlabs, effectiveQty)
  const lineTotal = currentSlab.price * effectiveQty
  const outOfStock = product.stockStatus === 'out_of_stock'

  const handleAdd = () => {
    dispatch(addToCart({ product, quantity: effectiveQty }))
    toast.success(`Added ${effectiveQty} ${product.unit} to cart`)
  }

  return (
    <Box className="animate-fade-up">
      <PageHeader
        title=""
        crumbs={[
          { label: 'Home', to: ROUTES.home },
          { label: 'Marketplace', to: ROUTES.products },
          { label: product.category, to: `${ROUTES.products}?category=${encodeURIComponent(product.category)}` },
        ]}
      />

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: { xs: 3, md: 8 }, mt: { xs: -1.5, md: -2 } }}>
        {/* Gallery */}
        <Box>
          <Box sx={{ borderRadius: 4, overflow: 'hidden', border: '1px solid var(--ink-200)', height: { xs: 260, sm: 360, md: 420 } }}>
            <ProductThumb id={product.id} name={product.name} variant={activeImg} rounded={0} height="100%" fontSize={{ xs: '2.5rem', md: '4rem' }} />
          </Box>
          <Box sx={{ display: 'flex', gap: { xs: 1.5, md: 3 }, mt: { xs: 1.5, md: 3 } }}>
            {[0, 1, 2, 3].map((v) => (
              <Box
                key={v}
                onClick={() => setActiveImg(v)}
                sx={{
                  width: { xs: 60, sm: 76, md: 84 },
                  height: { xs: 60, sm: 76, md: 84 },
                  borderRadius: 2.5,
                  overflow: 'hidden',
                  cursor: 'pointer',
                  border: activeImg === v ? '2px solid var(--brand-500)' : '2px solid transparent',
                  outline: '1px solid var(--ink-200)',
                }}
              >
                <ProductThumb id={product.id} name={product.name} variant={v} rounded={0} fontSize={{ xs: '0.85rem', md: '1.2rem' }} />
              </Box>
            ))}
          </Box>
        </Box>

        {/* Info + buy box */}
        <Box>
          <Box className="flex flex-wrap items-center gap-2 mb-2">
            <StatusChip kind="stock" value={product.stockStatus} />
            {product.isNew && (
              <Chip size="small" icon={<BoltRoundedIcon sx={{ fontSize: 14 }} />} label="New arrival" color="secondary" variant="outlined" />
            )}
            {product.tags?.map((t) => (
              <Chip key={t} size="small" label={t} variant="outlined" />
            ))}
          </Box>

          <Typography variant="h4" sx={{ fontSize: { xs: 24, md: 30 }, mb: 1 }}>
            {product.name}
          </Typography>

          <Box className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mb-3">
            <Box className="flex items-center gap-1">
              <StarRoundedIcon sx={{ fontSize: 19, color: '#E0A95A' }} />
              <Typography sx={{ fontWeight: 700 }} className="tnum">
                {product.rating.toFixed(1)}
              </Typography>
            </Box>
            <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', sm: 'block' } }} />
            <Box className="flex items-center gap-1.5 text-[13px]" sx={{ color: 'var(--ink-500)' }}>
              <PublicRoundedIcon sx={{ fontSize: 17 }} /> Origin: {product.origin}
            </Box>
            <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', sm: 'block' } }} />
            <Box className="flex items-center gap-1.5 text-[13px]" sx={{ color: 'var(--ink-500)' }}>
              <LocalShippingRoundedIcon sx={{ fontSize: 17 }} /> Lead {product.leadTimeDays}d
            </Box>
          </Box>

          <Typography color="text.secondary" sx={{ mb: 3 }}>
            {product.shortDescription}
          </Typography>

          {/* Lot-based pricing */}
          <Box sx={{ borderRadius: 3, border: '1px solid var(--ink-200)', overflow: 'hidden', mb: 3 }}>
            <Box sx={{ px: 2, py: 1.25, bgcolor: 'var(--ink-50)', borderBottom: '1px solid var(--ink-200)' }}>
              <Typography sx={{ fontWeight: 700, fontSize: 13, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--ink-600)' }}>
                Lot-based wholesale pricing
              </Typography>
            </Box>
            <Table size="small">
              <TableBody>
                {product.pricingSlabs.map((s) => {
                  const active = effectiveQty >= s.minQty && (s.maxQty === null || effectiveQty <= s.maxQty)
                  return (
                    <TableRow
                      key={s.label}
                      sx={{
                        bgcolor: active ? 'var(--brand-50)' : 'transparent',
                        '& td': { borderColor: 'var(--ink-100)' },
                      }}
                    >
                      <TableCell sx={{ fontWeight: active ? 700 : 500 }}>
                        {active && '▸ '}
                        {s.label}
                      </TableCell>
                      <TableCell align="right" className="tnum" sx={{ fontWeight: 700, color: active ? 'var(--brand-700)' : 'inherit' }}>
                        {formatMoney(s.price)}
                        <Box component="span" sx={{ fontSize: 12, color: 'var(--ink-500)', fontWeight: 500 }}>
                          /{product.unit}
                        </Box>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </Box>

          {/* Buy box */}
          <Box sx={{ borderRadius: 4, border: '1px solid var(--ink-200)', p: { xs: 2, md: 3 }, bgcolor: '#fff', boxShadow: '0 1px 3px rgba(22,27,36,0.05)' }}>
            <Box className="flex items-end justify-between mb-4 flex-wrap gap-3">
              <Box>
                <Typography sx={{ fontSize: 11.5, color: 'var(--ink-500)', fontWeight: 600 }}>YOUR PRICE</Typography>
                <Box className="flex items-baseline gap-1.5">
                  <Typography className="tnum" sx={{ fontFamily: '"Bricolage Grotesque", serif', fontWeight: 800, fontSize: { xs: 24, md: 34 }, lineHeight: 1 }}>
                    {formatMoney(currentSlab.price)}
                  </Typography>
                  <Typography sx={{ color: 'var(--ink-500)', fontWeight: 600, fontSize: { xs: 13, md: 15 } }}>/{product.unit}</Typography>
                  {savings > 0 && (
                    <Chip size="small" color="success" label={`Save ${savings}%`} sx={{ ml: 0.5, height: 20, '& .MuiChip-label': { px: 0.75, fontSize: 10.5 } }} />
                  )}
                </Box>
              </Box>
              <Box className="text-right">
                <Typography sx={{ fontSize: 11.5, color: 'var(--ink-500)', fontWeight: 600 }}>AVAILABLE</Typography>
                <Typography className="tnum" sx={{ fontWeight: 700, fontSize: { xs: 13, md: 15 } }}>
                  {product.availableStock.toLocaleString('en-IN')} {product.unit}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'auto 1fr' }, gap: { xs: 2, md: 3 }, mb: { xs: 2.5, md: 4 } }}>
              <Box>
                <Typography sx={{ fontSize: 11.5, color: 'var(--ink-500)', fontWeight: 600, mb: 0.5 }}>
                  QUANTITY (MOQ {product.moq})
                </Typography>
                <QuantityStepper
                  value={effectiveQty}
                  onChange={setQty}
                  min={product.moq}
                  max={product.availableStock || undefined}
                  unit={product.unit}
                />
              </Box>
              <Box sx={{ flex: 1, minWidth: 140 }}>
                <Typography sx={{ fontSize: 11.5, color: 'var(--ink-500)', fontWeight: 600, mb: 0.5 }}>ORDER TOTAL</Typography>
                <Typography className="tnum" sx={{ fontFamily: '"Bricolage Grotesque", serif', fontWeight: 800, fontSize: { xs: 20, md: 26 }, color: 'var(--brand-700)' }}>
                  {formatMoney(lineTotal)}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: { xs: 1.5, md: 3 } }}>
              <Button
                variant="contained"
                size="large"
                sx={{
                  flex: 1,
                  py: { xs: 1, md: 1.5 },
                  fontSize: { xs: 13, md: 15 },
                  whiteSpace: 'nowrap',
                }}
                startIcon={<ShoppingCartRoundedIcon />}
                disabled={outOfStock}
                onClick={handleAdd}
              >
                {outOfStock ? 'Out of stock' : 'Add to cart'}
              </Button>
              <Button
                variant="outlined"
                size="large"
                sx={{
                  flex: 1,
                  py: { xs: 1, md: 1.5 },
                  fontSize: { xs: 13, md: 15 },
                  whiteSpace: 'nowrap',
                }}
                disabled={outOfStock}
                onClick={() => {
                  handleAdd()
                  navigate(ROUTES.cart)
                }}
              >
                Buy now
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Description & specs */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, gap: { xs: 4, md: 8 }, mt: { xs: 6, md: 12 } }}>
        <Box>
          <Typography variant="h5" sx={{ mb: 2 }}>
            Product description
          </Typography>
          <Typography color="text.secondary" sx={{ lineHeight: 1.7, mb: 4 }}>
            {product.description}
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            {[
              { icon: <VerifiedRoundedIcon />, label: 'Verified supplier' },
              { icon: <LocalShippingRoundedIcon />, label: `Dispatch in ${product.leadTimeDays} days` },
              { icon: <PublicRoundedIcon />, label: `Origin · ${product.origin}` },
            ].map((f, i) => (
              <Box
                key={i}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  px: 2,
                  py: 1.25,
                  borderRadius: 2.5,
                  border: '1px solid var(--ink-200)',
                  bgcolor: '#fff',
                  color: 'var(--brand-700)',
                  flex: { xs: '1 1 100%', sm: '0 1 auto' },
                }}
              >
                {f.icon}
                <Typography sx={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink-800)' }}>{f.label}</Typography>
              </Box>
            ))}
          </Box>
        </Box>
        <Box>
          <Typography variant="h5" sx={{ mb: 2 }}>
            Specifications
          </Typography>
          <Box sx={{ borderRadius: 3, border: '1px solid var(--ink-200)', overflow: 'hidden', bgcolor: '#fff' }}>
            <Table size="small">
              <TableBody>
                {Object.entries(product.specifications).map(([k, v]) => (
                  <TableRow key={k} sx={{ '& td': { borderColor: 'var(--ink-100)' } }}>
                    <TableCell sx={{ color: 'var(--ink-500)', fontWeight: 500 }}>{k}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                      {v}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
