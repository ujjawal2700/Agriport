import { useState, useMemo } from 'react'
import {
  Box,
  Typography,
  Button,
  TextField,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
  Divider,
  Paper,
  Slide,
  Backdrop,
} from '@mui/material'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import InventoryRoundedIcon from '@mui/icons-material/InventoryRounded'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import StatusChip from '@/components/common/StatusChip'
import StockFormDialog from '@/components/executive/StockFormDialog'
import { formatMoney } from '@/utils/format'

import { products as mockProducts } from '@/mocks/data'
import type { Product } from '@/types'

// Local runtime store (mirrors mock data, resets on page reload — no backend yet)
const runtimeProducts: Product[] = [...mockProducts]

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Box className="flex justify-between items-start" sx={{ py: 0.75 }}>
      <Typography sx={{ fontSize: 12.5, color: 'var(--ink-500)', minWidth: 120 }}>{label}</Typography>
      <Typography sx={{ fontSize: 12.5, fontWeight: 600, textAlign: 'right', flex: 1 }}>{value}</Typography>
    </Box>
  )
}

export default function ExecutiveProductsPage() {
  const [localProducts, setLocalProducts] = useState<Product[]>([...runtimeProducts])
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [detailProduct, setDetailProduct] = useState<Product | null>(null)

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return localProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.origin.toLowerCase().includes(q),
    )
  }, [localProducts, search])

  const openAdd = () => {
    setEditing(null)
    setOpen(true)
  }


  const handleSaveCallback = (savedProduct: Product, mode: 'add' | 'update') => {
    if (mode === 'update') {
      setLocalProducts((prev) => prev.map((p) => (p.id === savedProduct.id ? savedProduct : p)))
    } else {
      setLocalProducts((prev) => [savedProduct, ...prev])
    }
  }

  return (
    <Box className="flex flex-col gap-5">
      {/* Header bar */}
      <Box className="flex items-center justify-between flex-wrap gap-3">
        <Box>
          <Typography sx={{ fontWeight: 700, fontSize: 20 }}>Product Management</Typography>
          <Typography sx={{ fontSize: 13, color: 'var(--ink-500)' }}>
            {localProducts.length} products · manage catalogue, stock & specifications
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddRoundedIcon />}
          onClick={openAdd}
          sx={{ borderRadius: 2.5, fontWeight: 700 }}
        >
          Add Stock
        </Button>
      </Box>

      {/* Search */}
      <TextField
        size="small"
        placeholder="Search by name, category or origin…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ maxWidth: 420, '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }}
      />

      {/* Table */}
      <Box sx={{ borderRadius: 3, border: '1px solid var(--ink-200)', overflow: 'hidden', bgcolor: '#fff' }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: 'var(--ink-50)', '& th': { fontWeight: 700, fontSize: 12, color: 'var(--ink-600)', letterSpacing: '0.04em', textTransform: 'uppercase', borderColor: 'var(--ink-200)' } }}>
              <TableCell>Product</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Origin</TableCell>
              <TableCell>Available Stock</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 6, color: 'var(--ink-400)' }}>
                  <InventoryRoundedIcon sx={{ fontSize: 36, mb: 1, display: 'block', mx: 'auto', opacity: 0.4 }} />
                  No products found
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((p) => (
                <TableRow
                  key={p.id}
                  onClick={() => setDetailProduct(p)}
                  sx={{ cursor: 'pointer', '& td': { borderColor: 'var(--ink-100)', py: 1.25 }, '&:hover': { bgcolor: 'var(--ink-50)' } }}
                >
                  <TableCell>
                    <Typography sx={{ fontWeight: 600, fontSize: 13.5, lineHeight: 1.3 }}>{p.name}</Typography>
                    <Typography sx={{ fontSize: 11.5, color: 'var(--ink-500)' }}>{p.shortDescription}</Typography>
                    <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5, flexWrap: 'wrap' }}>
                      {p.isNew && <Chip size="small" label="New" color="secondary" sx={{ height: 18, fontSize: 10 }} />}
                      {p.isFeatured && <Chip size="small" label="Featured" sx={{ height: 18, fontSize: 10 }} />}
                      {(p.tags ?? []).map((t) => (
                        <Chip key={t} size="small" label={t} variant="outlined" sx={{ height: 18, fontSize: 10 }} />
                      ))}
                    </Box>
                  </TableCell>
                  <TableCell sx={{ fontSize: 13 }}>{p.category}</TableCell>
                  <TableCell sx={{ fontSize: 13 }}>{p.origin}</TableCell>
                  <TableCell sx={{ fontSize: 13, fontWeight: 600 }}>{p.availableStock.toLocaleString('en-IN')} {p.unit}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Box>

      {/* Backdrop */}
      <Backdrop
        open={!!detailProduct}
        onClick={() => setDetailProduct(null)}
        sx={{ zIndex: 1200, bgcolor: 'rgba(0,0,0,0.15)' }}
      />

      {/* Product Detail Floating Card */}
      <Slide direction="left" in={!!detailProduct} mountOnEnter unmountOnExit>
        <Paper
          elevation={8}
          sx={{
            position: 'fixed',
            bottom: 80,
            right: 24,
            width: 400,
            maxHeight: '70vh',
            zIndex: 1300,
            borderRadius: 3,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: '0 12px 40px rgba(0,0,0,0.18)',
          }}
        >
          {detailProduct && (
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', maxHeight: '70vh' }}>
              {/* Header */}
              <Box sx={{ px: 2.5, pt: 2.5, pb: 1.5, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', borderBottom: '1px solid var(--ink-100)' }}>
                <Box sx={{ flex: 1, pr: 1 }}>
                  <Typography sx={{ fontWeight: 700, fontSize: 14, lineHeight: 1.4 }}>{detailProduct.name}</Typography>
                  <Typography sx={{ fontSize: 11.5, color: 'var(--ink-500)', mt: 0.25 }}>{detailProduct.category}</Typography>
                  <Box sx={{ display: 'flex', gap: 0.5, mt: 0.75, flexWrap: 'wrap', alignItems: 'center' }}>
                    <StatusChip kind="stock" value={detailProduct.stockStatus} />
                    {detailProduct.isNew && <Chip size="small" label="New" color="secondary" sx={{ height: 18, fontSize: 10 }} />}
                    {detailProduct.isFeatured && <Chip size="small" label="Featured" sx={{ height: 18, fontSize: 10 }} />}
                  </Box>
                </Box>
                <IconButton size="small" onClick={() => setDetailProduct(null)}>
                  <CloseRoundedIcon fontSize="small" />
                </IconButton>
              </Box>

              {/* Scrollable body */}
              <Box sx={{ flex: 1, overflowY: 'auto', px: 2.5, py: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>

                {/* Description */}
                {detailProduct.description && (
                  <Box>
                    <Typography sx={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', color: 'var(--ink-400)', letterSpacing: '0.06em', mb: 0.75 }}>Description</Typography>
                    <Typography sx={{ fontSize: 12, color: 'var(--ink-700)', lineHeight: 1.6 }}>{detailProduct.description}</Typography>
                  </Box>
                )}

                <Divider />

                {/* Core details */}
                <Box>
                  <Typography sx={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', color: 'var(--ink-400)', letterSpacing: '0.06em', mb: 0.5 }}>Details</Typography>
                  <DetailRow label="Origin" value={detailProduct.origin} />
                  <DetailRow label="Unit" value={detailProduct.unit} />
                  <DetailRow label="MOQ" value={`${detailProduct.moq} ${detailProduct.unit}`} />
                  <DetailRow label="Available Stock" value={`${detailProduct.availableStock.toLocaleString('en-IN')} ${detailProduct.unit}`} />
                  <DetailRow label="Base Price" value={`${detailProduct.currency}${detailProduct.basePrice.toLocaleString('en-IN')} / ${detailProduct.unit}`} />
                  <DetailRow label="Lead Time" value={`${detailProduct.leadTimeDays} days`} />
                  <DetailRow label="Rating" value={`${detailProduct.rating} / 5`} />
                </Box>

                <Divider />

                {/* Pricing Slabs */}
                {detailProduct.pricingSlabs && detailProduct.pricingSlabs.length > 0 && (
                  <Box>
                    <Typography sx={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', color: 'var(--ink-400)', letterSpacing: '0.06em', mb: 0.75 }}>Pricing Slabs</Typography>
                    {detailProduct.pricingSlabs.map((slab, i) => (
                      <Box key={i} className="flex justify-between" sx={{ py: 0.5, borderBottom: '1px solid var(--ink-100)' }}>
                        <Typography sx={{ fontSize: 12, color: 'var(--ink-600)' }}>{slab.label}</Typography>
                        <Typography sx={{ fontSize: 12, fontWeight: 700, color: '#1C7C58' }}>{formatMoney(slab.price)}</Typography>
                      </Box>
                    ))}
                  </Box>
                )}

                {/* Specifications */}
                {detailProduct.specifications && Object.keys(detailProduct.specifications).length > 0 && (
                  <Box>
                    <Typography sx={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', color: 'var(--ink-400)', letterSpacing: '0.06em', mb: 0.5 }}>Specifications</Typography>
                    {Object.entries(detailProduct.specifications).map(([key, val]) => {
                      const displayVal = key === 'Grade' ? 'Imported' : val
                      return displayVal ? <DetailRow key={key} label={key} value={displayVal} /> : null
                    })}
                  </Box>
                )}

                {/* Tags */}
                {(detailProduct.tags ?? []).length > 0 && (
                  <Box>
                    <Typography sx={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', color: 'var(--ink-400)', letterSpacing: '0.06em', mb: 0.75 }}>Tags</Typography>
                    <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
                      {(detailProduct.tags ?? []).map((t) => (
                        <Chip key={t} size="small" label={t} variant="outlined" />
                      ))}
                    </Box>
                  </Box>
                )}

                {/* Size Variants */}
                {(detailProduct.sizeVariants ?? []).length > 0 && (
                  <Box>
                    <Typography sx={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', color: 'var(--ink-400)', letterSpacing: '0.06em', mb: 0.75 }}>Size Variants</Typography>
                    {(detailProduct.sizeVariants ?? []).map((v, i) => (
                      <Box key={i} className="flex justify-between" sx={{ py: 0.5, borderBottom: '1px solid var(--ink-100)' }}>
                        <Typography sx={{ fontSize: 12, color: 'var(--ink-600)' }}>Size {v.size}</Typography>
                        <Typography sx={{ fontSize: 12, fontWeight: 600 }}>
                          {v.stock} {detailProduct.unit} · {formatMoney(v.price)}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                )}

              </Box>
            </Box>
          )}
        </Paper>
      </Slide>

      {/* Stock Form Dialog */}
      <StockFormDialog
        open={open}
        onClose={() => setOpen(false)}
        productToEdit={editing}
        onSave={handleSaveCallback}
      />
    </Box>
  )
}
