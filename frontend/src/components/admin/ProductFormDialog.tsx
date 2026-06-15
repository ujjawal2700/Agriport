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
        setForm({ ...blank, category: categories[0] ?? '' })
        setSpecs(blankSpecs())
        setImages([])
      }
    }
  }, [open, initial, categories])

  const str = (key: keyof typeof form) => (e: ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }))

  const slabs = generateSlabs(form.basePrice || 100)
  const valid = form.name.trim() && form.category

  const handleSave = () => {
    const tags = form.tags.split(',').map((t) => t.trim()).filter(Boolean)
    const product: Product = {
      id: initial?.id ?? `p-${Date.now()}`,
      name: form.name.trim(),
      category: form.category,
      images,
      shortDescription: form.shortDescription || form.name.trim(),
      description: form.description || form.shortDescription || form.name.trim(),
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
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth slotProps={{ paper: { sx: { borderRadius: 4 } } }}>
      <DialogTitle sx={{ fontFamily: '"Bricolage Grotesque", serif', fontWeight: 700, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {initial ? 'Edit product' : 'Add product'}
        <IconButton size="small" onClick={onClose}><CloseRoundedIcon /></IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 3 }}>
        <TextField label="Product name *" value={form.name} onChange={str('name')} fullWidth size="small" />
        
        <TextField label="Category *" value={form.category} onChange={str('category')} select fullWidth size="small">
          {categories.map((c) => (
            <MenuItem key={c} value={c}>{c}</MenuItem>
          ))}
        </TextField>

        <TextField label="Origin" value={form.origin} onChange={str('origin')} select fullWidth size="small">
          {COUNTRIES.map((country) => (
            <MenuItem key={country} value={country}>
              {country}
            </MenuItem>
          ))}
        </TextField>
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
