import { useEffect, useState } from 'react'
import type { ChangeEvent } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Box,
  Typography,
  Divider,
  Switch,
  FormControlLabel,
  IconButton,
} from '@mui/material'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import type { Product, StockStatus } from '@/types'
import { generateSlabs } from '@/utils/pricing'

interface Props {
  open: boolean
  initial: Product | null
  categories: string[]
  onClose: () => void
  onSave: (product: Product) => void
}

const STOCK_STATUSES: { value: StockStatus; label: string }[] = [
  { value: 'in_stock', label: 'In Stock' },
  { value: 'low_stock', label: 'Low Stock' },
  { value: 'out_of_stock', label: 'Out of Stock' },
]

const PACKING_TYPES = ['Cartoon', 'Basket']

const blankSpecs = () => ({
  Grade: 'Import',
  Packing: '',
  'Brand Name': '',
  'Packing Type': 'Cartoon',
  'Size or Count': '',
  Origin: '',
})

const blank = {
  name: '',
  category: '',
  unit: 'piece',
  moq: 1,
  availableStock: 0,
  stockStatus: 'in_stock' as StockStatus,
  basePrice: 0,
  shortDescription: '',
  description: '',
  origin: 'India',
  leadTimeDays: 5,
  isNew: false,
  isFeatured: false,
  tags: '',
  // Requirements customization
  sizePlaceholder: '',
  containerOptionFull: '',
  containerOptionHalf: '',
  showContainerOptions: true,
}

export default function ProductFormDialog({ open, initial, categories, onClose, onSave }: Props) {
  const [form, setForm] = useState(blank)
  const [specs, setSpecs] = useState<Record<string, string>>(blankSpecs())
  const [images, setImages] = useState<string[]>([])

  useEffect(() => {
    if (open) {
      if (initial) {
        setForm({
          name: initial.name,
          category: initial.category,
          unit: initial.unit,
          moq: initial.moq,
          availableStock: initial.availableStock,
          stockStatus: initial.stockStatus,
          basePrice: initial.basePrice,
          shortDescription: initial.shortDescription,
          description: initial.description ?? '',
          origin: initial.origin,
          leadTimeDays: initial.leadTimeDays,
          isNew: initial.isNew ?? false,
          isFeatured: initial.isFeatured ?? false,
          tags: (initial.tags ?? []).join(', '),
          sizePlaceholder: initial.sizePlaceholder ?? '',
          containerOptionFull: initial.containerOptionFull ?? '',
          containerOptionHalf: initial.containerOptionHalf ?? '',
          showContainerOptions: initial.showContainerOptions ?? true,
        })
        setSpecs({ ...blankSpecs(), ...initial.specifications })
        setImages(initial.images ?? [])
      } else {
        setForm({ ...blank, category: categories[0] ?? '' })
        setSpecs(blankSpecs())
        setImages([])
      }
    }
  }, [open, initial, categories])

  const num = (key: keyof typeof form) => (e: ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: Number(e.target.value) }))
  const str = (key: keyof typeof form) => (e: ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }))
  const setSpec = (key: string, val: string) =>
    setSpecs((s) => ({ ...s, [key]: val }))

  const handleImageUpload = (slotIdx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const result = ev.target?.result as string
      setImages((prev) => {
        const next = [...prev]
        while (next.length < 5) next.push('')
        next[slotIdx] = result
        return next
      })
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const removeImage = (slotIdx: number) =>
    setImages((prev) => {
      const next = [...prev]
      while (next.length < 5) next.push('')
      next[slotIdx] = ''
      return next
    })

  const slabs = generateSlabs(form.basePrice || 0)
  const valid = form.name.trim() && form.category && form.basePrice > 0 && form.moq > 0

  const handleSave = () => {
    const tags = form.tags.split(',').map((t) => t.trim()).filter(Boolean)
    const product: Product = {
      id: initial?.id ?? `p-${Date.now()}`,
      name: form.name.trim(),
      category: form.category,
      images,
      shortDescription: form.shortDescription,
      description: form.description || form.shortDescription,
      specifications: { ...specs, Origin: form.origin },
      unit: form.unit,
      moq: form.moq,
      availableStock: form.availableStock,
      stockStatus: form.stockStatus,
      basePrice: form.basePrice,
      currency: '₹',
      pricingSlabs: slabs,
      rating: initial?.rating ?? 4.5,
      origin: form.origin,
      leadTimeDays: form.leadTimeDays,
      isFeatured: form.isFeatured,
      isNew: form.isNew,
      tags,
      sizePlaceholder: form.sizePlaceholder || undefined,
      containerOptionFull: form.containerOptionFull || undefined,
      containerOptionHalf: form.containerOptionHalf || undefined,
      showContainerOptions: form.showContainerOptions,
    }
    onSave(product)
    onClose()
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth slotProps={{ paper: { sx: { borderRadius: 4 } } }}>
      <DialogTitle sx={{ fontFamily: '"Bricolage Grotesque", serif', fontWeight: 700, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {initial ? 'Edit product' : 'Add product'}
        <IconButton size="small" onClick={onClose}><CloseRoundedIcon /></IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 3 }}>

        {/* Basic Info */}
        <Box>
          <Typography sx={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.05em', color: 'var(--ink-500)', mb: 1.5, textTransform: 'uppercase' }}>
            Basic Information
          </Typography>
          <Box className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <Box className="sm:col-span-2">
              <TextField label="Product name *" value={form.name} onChange={str('name')} fullWidth size="small" />
            </Box>
            <TextField label="Category *" value={form.category} onChange={str('category')} select fullWidth size="small">
              {categories.map((c) => (
                <MenuItem key={c} value={c}>{c}</MenuItem>
              ))}
            </TextField>
            <TextField label="Short description" value={form.shortDescription} onChange={str('shortDescription')} fullWidth size="small" />
            <TextField label="Origin" value={form.origin} onChange={str('origin')} fullWidth size="small" />
            <TextField label="Lead time (days)" type="number" value={form.leadTimeDays} onChange={num('leadTimeDays')} fullWidth size="small" />
            <TextField label="Tags (comma separated)" value={form.tags} onChange={str('tags')} fullWidth size="small" placeholder="e.g. Export grade, CE certified" />
            <Box className="sm:col-span-2">
              <TextField label="Full description" value={form.description} onChange={str('description')} fullWidth size="small" multiline minRows={3} />
            </Box>
            <Box className="flex gap-4">
              <FormControlLabel
                control={<Switch checked={form.isNew} onChange={(e) => setForm((f) => ({ ...f, isNew: e.target.checked }))} />}
                label={<Typography sx={{ fontSize: 13.5 }}>New Arrival</Typography>}
              />
              <FormControlLabel
                control={<Switch checked={form.isFeatured} onChange={(e) => setForm((f) => ({ ...f, isFeatured: e.target.checked }))} />}
                label={<Typography sx={{ fontSize: 13.5 }}>Featured</Typography>}
              />
            </Box>
          </Box>
        </Box>

        <Divider />

        {/* Requirements */}
        <Box>
          <Typography sx={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.05em', color: 'var(--ink-500)', mb: 1.5, textTransform: 'uppercase' }}>
            Requirements
          </Typography>
          <Box className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <TextField label="Unit (e.g. sack, box) *" value={form.unit} onChange={str('unit')} fullWidth size="small" />
            <TextField label="MOQ (Min. Order Qty) *" type="number" value={form.moq} onChange={num('moq')} fullWidth size="small" />
            <TextField label="Available stock" type="number" value={form.availableStock} onChange={num('availableStock')} fullWidth size="small" />
            <TextField label="Stock status" value={form.stockStatus} onChange={str('stockStatus')} select fullWidth size="small">
              {STOCK_STATUSES.map((s) => (
                <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>
              ))}
            </TextField>
            <TextField
              label="Specific Size placeholder"
              value={form.sizePlaceholder}
              onChange={str('sizePlaceholder')}
              fullWidth
              size="small"
              placeholder="e.g. 400×300×300 mm"
              helperText="Hint text shown in Specific Size input"
            />
          </Box>

          {/* Container Options customization */}
          <Box sx={{ mt: 2.5, p: 2, borderRadius: 2, border: '1px solid var(--ink-200)', bgcolor: 'var(--ink-50)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
              <Typography sx={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-600)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Container Option Buttons
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={form.showContainerOptions}
                    onChange={(e) => setForm((f) => ({ ...f, showContainerOptions: e.target.checked }))}
                    size="small"
                  />
                }
                label={<Typography sx={{ fontSize: 12, color: 'var(--ink-500)' }}>{form.showContainerOptions ? 'Visible' : 'Hidden'}</Typography>}
              />
            </Box>
            {form.showContainerOptions && (
              <Box className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <TextField
                  label="Full Container label"
                  value={form.containerOptionFull}
                  onChange={str('containerOptionFull')}
                  fullWidth
                  size="small"
                  placeholder="Full Container"
                  helperText="Leave blank to use default"
                />
                <TextField
                  label="Half Container label"
                  value={form.containerOptionHalf}
                  onChange={str('containerOptionHalf')}
                  fullWidth
                  size="small"
                  placeholder="Half Container"
                  helperText="Leave blank to use default"
                />
              </Box>
            )}
          </Box>
        </Box>

        <Divider />

        {/* Specifications */}
        <Box>
          <Typography sx={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.05em', color: 'var(--ink-500)', mb: 1.5, textTransform: 'uppercase' }}>
            Specifications
          </Typography>
          <Box className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <TextField label="Grade" value={specs['Grade'] ?? ''} onChange={(e) => setSpec('Grade', e.target.value)} fullWidth size="small" />
            <TextField label="Packing" value={specs['Packing'] ?? ''} onChange={(e) => setSpec('Packing', e.target.value)} fullWidth size="small" placeholder="e.g. 25 kg sack, 30 pcs" />
            <TextField label="Brand Name" value={specs['Brand Name'] ?? ''} onChange={(e) => setSpec('Brand Name', e.target.value)} fullWidth size="small" />
            <TextField label="Packing Type" value={specs['Packing Type'] ?? 'Cartoon'} onChange={(e) => setSpec('Packing Type', e.target.value)} select fullWidth size="small">
              {PACKING_TYPES.map((pt) => (
                <MenuItem key={pt} value={pt}>{pt}</MenuItem>
              ))}
            </TextField>
            <TextField label="Size or Count" value={specs['Size or Count'] ?? ''} onChange={(e) => setSpec('Size or Count', e.target.value)} fullWidth size="small" placeholder="e.g. 8.3 mm, 24W, 400×300" />
            <TextField label="Origin (Spec)" value={specs['Origin'] ?? ''} onChange={(e) => setSpec('Origin', e.target.value)} fullWidth size="small" />
          </Box>
        </Box>

        <Divider />

        {/* Images */}
        <Box>
          <Typography sx={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.05em', color: 'var(--ink-500)', mb: 0.5, textTransform: 'uppercase' }}>
            Product Images (5 Views)
          </Typography>
          <Typography sx={{ fontSize: 11.5, color: 'var(--ink-400)', mb: 1.5 }}>
            Upload one image per slot — Main View + 4 angles.
          </Typography>
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            {['Main', 'Angle 2', 'Angle 3', 'Angle 4', 'Angle 5'].map((label, slotIdx) => {
              const src = images[slotIdx] ?? ''
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
                        <img src={src} alt={label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <IconButton
                          size="small"
                          onClick={() => removeImage(slotIdx)}
                          sx={{ position: 'absolute', top: 2, right: 2, bgcolor: 'rgba(0,0,0,0.55)', color: '#fff', p: '2px', '&:hover': { bgcolor: 'rgba(200,30,30,0.85)' } }}
                        >
                          <CloseRoundedIcon sx={{ fontSize: 12 }} />
                        </IconButton>
                        <Box
                          component="label"
                          sx={{ position: 'absolute', bottom: 2, right: 2, bgcolor: 'rgba(0,0,0,0.55)', color: '#fff', borderRadius: 0.75, px: 0.5, py: '1px', fontSize: 9, fontWeight: 700, cursor: 'pointer', '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' } }}
                        >
                          Replace
                          <input type="file" accept="image/*" hidden onChange={(e) => handleImageUpload(slotIdx, e)} />
                        </Box>
                      </>
                    ) : (
                      <>
                        <AddRoundedIcon sx={{ fontSize: 18, color: 'var(--ink-400)' }} />
                        <Typography sx={{ fontSize: 9, fontWeight: 600, color: 'var(--ink-400)', mt: 0.25 }}>Upload</Typography>
                        <input type="file" accept="image/*" hidden onChange={(e) => handleImageUpload(slotIdx, e)} />
                      </>
                    )}
                  </Box>
                </Box>
              )
            })}
          </Box>
        </Box>

      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <Button onClick={onClose} variant="outlined" sx={{ borderRadius: 2.5 }}>
          Cancel
        </Button>
        <Button onClick={handleSave} variant="contained" disabled={!valid} sx={{ borderRadius: 2.5, fontWeight: 700, px: 4 }}>
          {initial ? 'Save changes' : 'Add product'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
