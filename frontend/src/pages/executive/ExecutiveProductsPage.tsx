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
} from '@mui/material'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import EditRoundedIcon from '@mui/icons-material/EditRounded'
import InventoryRoundedIcon from '@mui/icons-material/InventoryRounded'
import StatusChip from '@/components/common/StatusChip'
import StockFormDialog from '@/components/executive/StockFormDialog'

import { products as mockProducts } from '@/mocks/data'
import type { Product } from '@/types'

// Local runtime store (mirrors mock data, resets on page reload — no backend yet)
const runtimeProducts: Product[] = [...mockProducts]

export default function ExecutiveProductsPage() {
  // Use local runtime list so new products appear immediately
  const [localProducts, setLocalProducts] = useState<Product[]>([...runtimeProducts])
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)

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

  const openEdit = (p: Product) => {
    setEditing(p)
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
              <TableCell>MOQ</TableCell>
              <TableCell>Stock</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 6, color: 'var(--ink-400)' }}>
                  <InventoryRoundedIcon sx={{ fontSize: 36, mb: 1, display: 'block', mx: 'auto', opacity: 0.4 }} />
                  No products found
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((p) => (
                <TableRow key={p.id} sx={{ '& td': { borderColor: 'var(--ink-100)', py: 1.25 }, '&:hover': { bgcolor: 'var(--ink-50)' } }}>
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
                  <TableCell sx={{ fontSize: 13, fontWeight: 600 }}>{p.moq} {p.unit}</TableCell>
                  <TableCell sx={{ fontSize: 13, fontWeight: 600 }}>{p.availableStock.toLocaleString('en-IN')} {p.unit}</TableCell>
                  <TableCell><StatusChip kind="stock" value={p.stockStatus} /></TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => openEdit(p)} sx={{ color: 'var(--brand-600)' }}>
                      <EditRoundedIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Box>

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
