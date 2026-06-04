import { useState, useMemo } from 'react'
import {
  Box,
  Typography,
  Button,
  TextField,
  MenuItem,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Divider,
  Switch,
  FormControlLabel,
} from '@mui/material'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import EditRoundedIcon from '@mui/icons-material/EditRounded'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import InventoryRoundedIcon from '@mui/icons-material/InventoryRounded'
import StatusChip from '@/components/common/StatusChip'
import { useGetCategoriesQuery } from '@/redux/api'
import { products as mockProducts } from '@/mocks/data'
import type { Product, StockStatus } from '@/types'
import toast from 'react-hot-toast'

// Local runtime store (mirrors mock data, resets on page reload — no backend yet)
const runtimeProducts: Product[] = [...mockProducts]

const STOCK_STATUSES: { value: StockStatus; label: string }[] = [
  { value: 'in_stock', label: 'In Stock' },
  { value: 'low_stock', label: 'Low Stock' },
  { value: 'out_of_stock', label: 'Out of Stock' },
]

const PACKING_TYPES = ['Cartoon', 'Basket']

const emptyForm = (): Partial<Product> => ({
  name: '',
  category: '',
  shortDescription: '',
  description: '',
  origin: '',
  unit: '',
  moq: 1,
  availableStock: 0,
  stockStatus: 'in_stock',
  basePrice: 0,
  leadTimeDays: 3,
  isNew: false,
  isFeatured: false,
  tags: [],
  specifications: {
    Grade: 'Import',
    Packing: '',
    'Brand Name': '',
    'Packing Type': 'Cartoon',
    'Size or Count': '',
    Origin: '',
  },
  pricingSlabs: [],
  images: [],
  currency: '₹',
  rating: 4.0,
  sizePlaceholder: '',
  containerOptionFull: '',
  containerOptionHalf: '',
  showContainerOptions: true,
})

export default function ExecutiveProductsPage() {
  const { data: categories } = useGetCategoriesQuery()
  // Use local runtime list so new products appear immediately
  const [localProducts, setLocalProducts] = useState<Product[]>([...runtimeProducts])
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [form, setForm] = useState<Partial<Product>>(emptyForm())
  const [tagsInput, setTagsInput] = useState('')
  const [uploadedImages, setUploadedImages] = useState<string[]>([])

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
    setForm(emptyForm())
    setTagsInput('')
    setUploadedImages([])
    setOpen(true)
  }

  const openEdit = (p: Product) => {
    setEditing(p)
    setForm({
      ...p,
      specifications: { ...p.specifications },
      sizePlaceholder: p.sizePlaceholder ?? '',
      containerOptionFull: p.containerOptionFull ?? '',
      containerOptionHalf: p.containerOptionHalf ?? '',
      showContainerOptions: p.showContainerOptions ?? true,
    })
    setTagsInput((p.tags ?? []).join(', '))
    setUploadedImages(p.images ?? [])
    setOpen(true)
  }

  const handleImageUpload = (slotIdx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const result = ev.target?.result as string
      setUploadedImages((prev) => {
        const next = [...prev]
        // ensure array has 4 slots
        while (next.length < 4) next.push('')
        next[slotIdx] = result
        return next
      })
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const removeImage = (slotIdx: number) =>
    setUploadedImages((prev) => {
      const next = [...prev]
      while (next.length < 4) next.push('')
      next[slotIdx] = ''
      return next
    })

  const close = () => setOpen(false)

  const setField = (key: keyof Product, val: unknown) =>
    setForm((f) => ({ ...f, [key]: val }))

  const setSpec = (key: string, val: string) =>
    setForm((f) => ({ ...f, specifications: { ...(f.specifications ?? {}), [key]: val } }))

  const buildSlabs = (base: number) => [
    { minQty: 1, maxQty: 10, price: base, label: '1–10 units' },
    { minQty: 11, maxQty: 50, price: Math.round(base * 0.92), label: '11–50 units' },
    { minQty: 51, maxQty: 200, price: Math.round(base * 0.85), label: '51–200 units' },
    { minQty: 201, maxQty: null, price: Math.round(base * 0.78), label: '201+ units (bulk)' },
  ]

  const handleSave = () => {
    if (!form.name?.trim() || !form.category?.trim() || !form.unit?.trim()) {
      toast.error('Name, Category and Unit are required.')
      return
    }
    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)

    const base = form.basePrice ?? 0

    if (editing) {
      const updated: Product = {
        ...editing,
        ...form,
        tags,
        images: uploadedImages,
        pricingSlabs: buildSlabs(base),
        specifications: {
          ...form.specifications,
          Origin: form.origin ?? form.specifications?.Origin ?? '',
        },
        sizePlaceholder: form.sizePlaceholder || undefined,
        containerOptionFull: form.containerOptionFull || undefined,
        containerOptionHalf: form.containerOptionHalf || undefined,
        showContainerOptions: form.showContainerOptions ?? true,
      } as Product
      setLocalProducts((prev) => prev.map((p) => (p.id === editing.id ? updated : p)))
      toast.success(`"${updated.name}" updated successfully`)
    } else {
      const newId = `p${Date.now()}`
      const newProduct: Product = {
        id: newId,
        name: form.name!,
        category: form.category!,
        images: uploadedImages,
        shortDescription: form.shortDescription ?? '',
        description: form.description ?? '',
        specifications: {
          Grade: form.specifications?.Grade ?? 'Import',
          Packing: form.specifications?.Packing ?? '',
          'Brand Name': form.specifications?.['Brand Name'] ?? '',
          'Packing Type': form.specifications?.['Packing Type'] ?? 'Cartoon',
          'Size or Count': form.specifications?.['Size or Count'] ?? '',
          Origin: form.origin ?? '',
        },
        unit: form.unit!,
        moq: form.moq ?? 1,
        availableStock: form.availableStock ?? 0,
        stockStatus: form.stockStatus ?? 'in_stock',
        basePrice: base,
        currency: '₹',
        pricingSlabs: buildSlabs(base),
        rating: 4.0,
        origin: form.origin ?? '',
        leadTimeDays: form.leadTimeDays ?? 3,
        isNew: form.isNew ?? false,
        isFeatured: form.isFeatured ?? false,
        tags,
        sizePlaceholder: form.sizePlaceholder || undefined,
        containerOptionFull: form.containerOptionFull || undefined,
        containerOptionHalf: form.containerOptionHalf || undefined,
        showContainerOptions: form.showContainerOptions ?? true,
      }
      setLocalProducts((prev) => [newProduct, ...prev])
      toast.success(`"${newProduct.name}" added successfully`)
    }
    close()
  }

  const specs = form.specifications ?? {}

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
          Add Product
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

      {/* Add / Edit Dialog */}
      <Dialog open={open} onClose={close} maxWidth="md" fullWidth slotProps={{ paper: { sx: { borderRadius: 4 } } }}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
          <Typography sx={{ fontWeight: 700, fontSize: 18 }}>
            {editing ? 'Edit Product' : 'Add New Product'}
          </Typography>
          <IconButton size="small" onClick={close}><CloseRoundedIcon /></IconButton>
        </DialogTitle>

        <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 3 }}>

          {/* Basic Info */}
          <Box>
            <Typography sx={{ fontWeight: 700, fontSize: 13.5, mb: 1.5, color: 'var(--ink-600)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Basic Information
            </Typography>
            <Box className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <TextField
                label="Product Name *"
                size="small"
                fullWidth
                value={form.name ?? ''}
                onChange={(e) => setField('name', e.target.value)}
              />
              <TextField
                label="Category *"
                size="small"
                select
                fullWidth
                value={form.category ?? ''}
                onChange={(e) => setField('category', e.target.value)}
              >
                {(categories ?? []).map((c) => (
                  <MenuItem key={c.id} value={c.name}>{c.name}</MenuItem>
                ))}
              </TextField>
              <TextField
                label="Short Description"
                size="small"
                fullWidth
                value={form.shortDescription ?? ''}
                onChange={(e) => setField('shortDescription', e.target.value)}
              />
              <TextField
                label="Origin (Country / Region)"
                size="small"
                fullWidth
                value={form.origin ?? ''}
                onChange={(e) => setField('origin', e.target.value)}
              />
              <TextField
                label="Lead Time (days)"
                size="small"
                type="number"
                fullWidth
                value={form.leadTimeDays ?? ''}
                onChange={(e) => setField('leadTimeDays', Number(e.target.value))}
              />
              <TextField
                label="Tags (comma separated)"
                size="small"
                fullWidth
                placeholder="e.g. Export grade, CE certified"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
              />
              <Box className="sm:col-span-2">
                <TextField
                  label="Full Description"
                  size="small"
                  fullWidth
                  multiline
                  rows={3}
                  value={form.description ?? ''}
                  onChange={(e) => setField('description', e.target.value)}
                />
              </Box>
              <Box className="flex gap-4">
                <FormControlLabel
                  control={<Switch checked={form.isNew ?? false} onChange={(e) => setField('isNew', e.target.checked)} />}
                  label={<Typography sx={{ fontSize: 13.5 }}>New Arrival</Typography>}
                />
                <FormControlLabel
                  control={<Switch checked={form.isFeatured ?? false} onChange={(e) => setField('isFeatured', e.target.checked)} />}
                  label={<Typography sx={{ fontSize: 13.5 }}>Featured</Typography>}
                />
              </Box>
            </Box>
          </Box>

          <Divider />

          {/* Requirements */}
          <Box>
            <Typography sx={{ fontWeight: 700, fontSize: 13.5, mb: 1.5, color: 'var(--ink-600)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Requirements
            </Typography>
            <Box className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <TextField
                label="Unit *"
                size="small"
                fullWidth
                placeholder="e.g. kg, sack, carton"
                value={form.unit ?? ''}
                onChange={(e) => setField('unit', e.target.value)}
              />
              <TextField
                label="MOQ (Min. Order Qty)"
                size="small"
                type="number"
                fullWidth
                value={form.moq ?? ''}
                onChange={(e) => setField('moq', Number(e.target.value))}
              />
              <TextField
                label="Available Stock"
                size="small"
                type="number"
                fullWidth
                value={form.availableStock ?? ''}
                onChange={(e) => setField('availableStock', Number(e.target.value))}
              />

              <TextField
                label="Stock Status"
                size="small"
                select
                fullWidth
                value={form.stockStatus ?? 'in_stock'}
                onChange={(e) => setField('stockStatus', e.target.value as StockStatus)}
              >
                {STOCK_STATUSES.map((s) => (
                  <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>
                ))}
              </TextField>
              <TextField
                label="Specific Size placeholder"
                size="small"
                fullWidth
                placeholder="e.g. 400×300×300 mm"
                value={form.sizePlaceholder ?? ''}
                onChange={(e) => setField('sizePlaceholder', e.target.value)}
                helperText="Hint text in Specific Size input"
              />
            </Box>


            {/* Container Options */}
            <Box sx={{ mt: 2.5, p: 2, borderRadius: 2, border: '1px solid var(--ink-200)', bgcolor: 'var(--ink-50)' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                <Typography sx={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-600)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Container Option Buttons
                </Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={form.showContainerOptions ?? true}
                      onChange={(e) => setField('showContainerOptions', e.target.checked)}
                      size="small"
                    />
                  }
                  label={<Typography sx={{ fontSize: 12, color: 'var(--ink-500)' }}>{(form.showContainerOptions ?? true) ? 'Visible' : 'Hidden'}</Typography>}
                />
              </Box>
              {(form.showContainerOptions ?? true) && (
                <Box className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <TextField
                    label="Full Container label"
                    size="small"
                    fullWidth
                    placeholder="Full Container"
                    value={form.containerOptionFull ?? ''}
                    onChange={(e) => setField('containerOptionFull', e.target.value)}
                    helperText="Leave blank to use default"
                  />
                  <TextField
                    label="Half Container label"
                    size="small"
                    fullWidth
                    placeholder="Half Container"
                    value={form.containerOptionHalf ?? ''}
                    onChange={(e) => setField('containerOptionHalf', e.target.value)}
                    helperText="Leave blank to use default"
                  />
                </Box>
              )}
            </Box>
          </Box>

          {/* Specifications */}
          <Box>
            <Typography sx={{ fontWeight: 700, fontSize: 13.5, mb: 1.5, color: 'var(--ink-600)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Specifications
            </Typography>
            <Box className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <TextField
                label="Grade"
                size="small"
                fullWidth
                value={specs['Grade'] ?? ''}
                onChange={(e) => setSpec('Grade', e.target.value)}
              />
              <TextField
                label="Packing"
                size="small"
                fullWidth
                placeholder="e.g. 25 kg sack, 30 pcs"
                value={specs['Packing'] ?? ''}
                onChange={(e) => setSpec('Packing', e.target.value)}
              />
              <TextField
                label="Brand Name"
                size="small"
                fullWidth
                value={specs['Brand Name'] ?? ''}
                onChange={(e) => setSpec('Brand Name', e.target.value)}
              />
              <TextField
                label="Packing Type"
                size="small"
                select
                fullWidth
                value={specs['Packing Type'] ?? 'Cartoon'}
                onChange={(e) => setSpec('Packing Type', e.target.value)}
              >
                {PACKING_TYPES.map((pt) => (
                  <MenuItem key={pt} value={pt}>{pt}</MenuItem>
                ))}
              </TextField>
              <TextField
                label="Size or Count"
                size="small"
                fullWidth
                placeholder="e.g. 8.3 mm, 24W, 400×300"
                value={specs['Size or Count'] ?? ''}
                onChange={(e) => setSpec('Size or Count', e.target.value)}
              />
              <TextField
                label="Origin (Spec)"
                size="small"
                fullWidth
                value={specs['Origin'] ?? ''}
                onChange={(e) => setSpec('Origin', e.target.value)}
              />
            </Box>
          </Box>

          <Divider />

          {/* Image Upload — 5 fixed variant slots */}
          <Box>
            <Typography sx={{ fontWeight: 700, fontSize: 13, mb: 0.25, color: 'var(--ink-600)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Product Images (5 Views)
            </Typography>
            <Typography sx={{ fontSize: 11.5, color: 'var(--ink-400)', mb: 1.5 }}>
              Upload one image per slot — Main View + 4 angles.
            </Typography>
            <Box sx={{ display: 'flex', gap: 1.5 }}>
              {['Main', 'Angle 2', 'Angle 3', 'Angle 4', 'Angle 5'].map((label, slotIdx) => {
                const src = uploadedImages[slotIdx] ?? ''
                return (
                  <Box key={slotIdx} sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, alignItems: 'center', width: 72 }}>
                    <Typography sx={{ fontSize: 10, fontWeight: 700, color: 'var(--ink-500)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      {label}
                    </Typography>
                    <Box
                      sx={{
                        position: 'relative',
                        width: 72,
                        height: 72,
                        borderRadius: 2,
                        overflow: 'hidden',
                        border: src ? '2px solid var(--brand-400)' : '2px dashed var(--ink-300)',
                        bgcolor: src ? 'transparent' : 'var(--ink-50)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'border-color 0.15s',
                      }}
                      component={src ? 'div' : 'label'}
                    >
                      {src ? (
                        <>
                          <img
                            src={src}
                            alt={label}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                          <IconButton
                            size="small"
                            onClick={() => removeImage(slotIdx)}
                            sx={{
                              position: 'absolute',
                              top: 2,
                              right: 2,
                              bgcolor: 'rgba(0,0,0,0.55)',
                              color: '#fff',
                              p: '2px',
                              '&:hover': { bgcolor: 'rgba(200,30,30,0.85)' },
                            }}
                          >
                            <CloseRoundedIcon sx={{ fontSize: 12 }} />
                          </IconButton>
                          <Box
                            component="label"
                            sx={{
                              position: 'absolute',
                              bottom: 2,
                              right: 2,
                              bgcolor: 'rgba(0,0,0,0.55)',
                              color: '#fff',
                              borderRadius: 0.75,
                              px: 0.5,
                              py: '1px',
                              fontSize: 9,
                              fontWeight: 700,
                              cursor: 'pointer',
                              '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' },
                            }}
                          >
                            Replace
                            <input
                              type="file"
                              accept="image/*"
                              hidden
                              onChange={(e) => handleImageUpload(slotIdx, e)}
                            />
                          </Box>
                        </>
                      ) : (
                        <>
                          <AddRoundedIcon sx={{ fontSize: 18, color: 'var(--ink-400)' }} />
                          <Typography sx={{ fontSize: 9, fontWeight: 600, color: 'var(--ink-400)', mt: 0.25 }}>Upload</Typography>
                          <input
                            type="file"
                            accept="image/*"
                            hidden
                            onChange={(e) => handleImageUpload(slotIdx, e)}
                          />
                        </>
                      )}
                    </Box>
                  </Box>
                )
              })}
            </Box>
          </Box>


        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, gap: 1.5 }}>
          <Button variant="outlined" onClick={close} sx={{ borderRadius: 2.5 }}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSave} sx={{ borderRadius: 2.5, fontWeight: 700, px: 4 }}>
            {editing ? 'Save Changes' : 'Add Product'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
