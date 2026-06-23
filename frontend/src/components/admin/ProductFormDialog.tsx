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
  IconButton,
  Box,
} from '@mui/material'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import type { Product, StockStatus } from '@/types'
import { generateSlabs } from '@/utils/pricing'
import { COUNTRIES } from '@/constants/countries'

interface Props {
  open: boolean
  initial: Product | null
  categories: string[]
  onClose: () => void
  onSave: (product: Product) => void
  loading?: boolean
}

const blankSpecs = () => ({
  Grade: 'Imported',
  Packing: '',
  'Brand Name': '',
  'Packing Type': 'Cartoon',
  'Size or Count': '',
  Origin: '',
})

const blank = {
  sku: '',
  name: '',
  category: '',
  unit: 'piece',
  moq: 1,
  availableStock: 0,
  stockStatus: 'in_stock' as StockStatus,
  basePrice: 100,
  shortDescription: '',
  description: '',
  origin: 'India',
  leadTimeDays: 5,
  isNew: false,
  isFeatured: false,
  tags: '',
  sizePlaceholder: '',
  containerOptionFull: '',
  containerOptionHalf: '',
  showContainerOptions: true,
}

export default function ProductFormDialog({ open, initial, categories, onClose, onSave, loading }: Props) {
  const [form, setForm] = useState(blank)
  const [specs, setSpecs] = useState<Record<string, string>>(blankSpecs())
  const [images, setImages] = useState<string[]>([])

  const isPending = loading ?? false

  useEffect(() => {
    if (open) {
      if (initial) {
        setForm({
          sku: initial.sku || '',
          name: initial.name,
          category: initial.category,
          unit: initial.unit,
          moq: initial.moq || 1,
          availableStock: initial.availableStock,
          stockStatus: initial.stockStatus,
          basePrice: initial.basePrice || 100,
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
        const generatedSku = 'PROD-' + Math.floor(1000 + Math.random() * 9000);
        setForm({ ...blank, sku: generatedSku, category: categories[0] ?? '' })
        setSpecs(blankSpecs())
        setImages([])
      }
    }
  }, [open, initial, categories])

  const str = (key: keyof typeof form) => (e: ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }))

  const num = (key: keyof typeof form) => (e: ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value)
    setForm((f) => ({ ...f, [key]: isNaN(val) ? 0 : val }))
  }

  const specChange = (key: string) => (e: ChangeEvent<HTMLInputElement>) => {
    setSpecs((s) => ({ ...s, [key]: e.target.value }))
  }

  const slabs = [
    { minQty: 1, maxQty: null, price: form.basePrice || 100, label: '1+ units' }
  ]
  
  const valid =
    form.name.trim().length >= 2 &&
    form.category &&
    form.description.trim().length >= 5 &&
    typeof form.basePrice === 'number' && form.basePrice >= 0 &&
    typeof form.availableStock === 'number' && form.availableStock >= 0 &&
    form.unit.trim().length > 0

  const handleSave = () => {
    const tags = form.tags.split(',').map((t) => t.trim()).filter(Boolean)
    const finalSpecs = {
      ...specs,
      Origin: form.origin,
      'Lead Time (Days)': form.leadTimeDays.toString(),
    }
    const product: Product = {
      id: initial?.id ?? `p-${Date.now()}`,
      sku: initial?.sku ?? (form.name.replace(/[^a-zA-Z0-9]/g, '').slice(0, 4).toUpperCase() + '-' + Math.floor(1000 + Math.random() * 9000)),
      name: form.name.trim(),
      category: form.category,
      images,
      shortDescription: form.description.substring(0, 100) + '...',
      description: form.description.trim(),
      specifications: finalSpecs,
      unit: form.unit,
      moq: 1,
      availableStock: form.availableStock,
      stockStatus: form.availableStock === 0 ? 'out_of_stock' : (form.availableStock < 10 ? 'low_stock' : 'in_stock'),
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
    if (loading === undefined) {
      onClose()
    }
  }

  return (
    <Dialog open={open} onClose={isPending ? undefined : onClose} maxWidth="sm" fullWidth slotProps={{ paper: { sx: { borderRadius: 4 } } }}>
      <DialogTitle sx={{ fontFamily: '"Bricolage Grotesque", serif', fontWeight: 700, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {initial ? 'Edit product' : 'Add product'}
        <IconButton size="small" onClick={onClose} disabled={isPending}><CloseRoundedIcon /></IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 3 }}>
        <TextField
          label="Product name *"
          value={form.name}
          onChange={str('name')}
          fullWidth
          size="small"
          disabled={isPending}
        />
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            label="Category *"
            value={form.category}
            onChange={str('category')}
            select
            fullWidth
            size="small"
            disabled={isPending}
          >
            {categories.map((c) => (
              <MenuItem key={c} value={c}>{c}</MenuItem>
            ))}
          </TextField>

          <TextField
            label="Origin"
            value={form.origin}
            onChange={str('origin')}
            select
            fullWidth
            size="small"
            disabled={isPending}
          >
            {COUNTRIES.map((country) => (
              <MenuItem key={country} value={country}>
                {country}
              </MenuItem>
            ))}
          </TextField>
        </Box>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            label="Unit *"
            value={form.unit}
            onChange={str('unit')}
            select
            fullWidth
            size="small"
            disabled={isPending}
          >
            {['piece', 'kg', 'bag', 'box', 'ton'].map((u) => (
              <MenuItem key={u} value={u}>{u}</MenuItem>
            ))}
          </TextField>

          <TextField
            label="Lead Time (Days) *"
            value={form.leadTimeDays}
            onChange={num('leadTimeDays')}
            type="number"
            fullWidth
            size="small"
            disabled={isPending}
          />
        </Box>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            label="Base Price (₹) *"
            value={form.basePrice}
            onChange={num('basePrice')}
            type="number"
            fullWidth
            size="small"
            disabled={isPending}
          />

          <TextField
            label="Available Stock *"
            value={form.availableStock}
            onChange={num('availableStock')}
            type="number"
            fullWidth
            size="small"
            disabled={isPending}
          />
        </Box>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            label="Grade"
            placeholder="e.g. Premium / A+"
            value={specs['Grade'] || ''}
            onChange={specChange('Grade')}
            fullWidth
            size="small"
            disabled={isPending}
          />
          <TextField
            label="Brand Name"
            placeholder="e.g. Local / Private Brand"
            value={specs['Brand Name'] || ''}
            onChange={specChange('Brand Name')}
            fullWidth
            size="small"
            disabled={isPending}
          />
        </Box>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            label="Packing"
            placeholder="e.g. 50kg gunny bag"
            value={specs['Packing'] || ''}
            onChange={specChange('Packing')}
            fullWidth
            size="small"
            disabled={isPending}
          />
          <TextField
            label="Size or Count"
            placeholder="e.g. 80-100 count"
            value={specs['Size or Count'] || ''}
            onChange={specChange('Size or Count')}
            fullWidth
            size="small"
            disabled={isPending}
          />
        </Box>

        <TextField
          label="Packing Type"
          value={specs['Packing Type'] || 'Cartoon'}
          onChange={specChange('Packing Type')}
          select
          fullWidth
          size="small"
          disabled={isPending}
        >
          {['Cartoon', 'Basket', 'Bag', 'Box'].map((t) => (
            <MenuItem key={t} value={t}>{t}</MenuItem>
          ))}
        </TextField>

        <TextField
          label="Description *"
          value={form.description}
          onChange={str('description')}
          multiline
          rows={3}
          fullWidth
          size="small"
          disabled={isPending}
        />
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <Button onClick={onClose} variant="outlined" sx={{ borderRadius: 2.5 }} disabled={isPending}>
          Cancel
        </Button>
        <Button onClick={handleSave} variant="contained" disabled={!valid || isPending} sx={{ borderRadius: 2.5, fontWeight: 700, px: 4 }}>
          {isPending ? 'Saving...' : (initial ? 'Save changes' : 'Add product')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
