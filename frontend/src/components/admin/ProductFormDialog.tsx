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
} from '@mui/material'
import type { Product, StockStatus } from '@/types'
import { generateSlabs } from '@/utils/pricing'
import { formatMoney } from '@/utils/format'

interface Props {
  open: boolean
  initial: Product | null
  categories: string[]
  onClose: () => void
  onSave: (product: Product) => void
}

const blank = {
  name: '',
  category: '',
  unit: 'piece',
  moq: 1,
  availableStock: 0,
  basePrice: 0,
  shortDescription: '',
  origin: 'India',
  leadTimeDays: 5,
}

function stockStatusFor(stock: number): StockStatus {
  if (stock <= 0) return 'out_of_stock'
  if (stock < 100) return 'low_stock'
  return 'in_stock'
}

export default function ProductFormDialog({ open, initial, categories, onClose, onSave }: Props) {
  const [form, setForm] = useState(blank)

  useEffect(() => {
    if (open) {
      setForm(
        initial
          ? {
              name: initial.name,
              category: initial.category,
              unit: initial.unit,
              moq: initial.moq,
              availableStock: initial.availableStock,
              basePrice: initial.basePrice,
              shortDescription: initial.shortDescription,
              origin: initial.origin,
              leadTimeDays: initial.leadTimeDays,
            }
          : { ...blank, category: categories[0] ?? '' },
      )
    }
  }, [open, initial, categories])

  const num = (key: keyof typeof form) => (e: ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: Number(e.target.value) }))
  const str = (key: keyof typeof form) => (e: ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }))

  const slabs = generateSlabs(form.basePrice || 0)
  const valid = form.name.trim() && form.category && form.basePrice > 0 && form.moq > 0

  const handleSave = () => {
    const product: Product = {
      id: initial?.id ?? `p-${Date.now()}`,
      name: form.name.trim(),
      category: form.category,
      images: initial?.images ?? [],
      shortDescription: form.shortDescription,
      description: initial?.description ?? form.shortDescription,
      specifications: initial?.specifications ?? {},
      unit: form.unit,
      moq: form.moq,
      availableStock: form.availableStock,
      stockStatus: stockStatusFor(form.availableStock),
      basePrice: form.basePrice,
      currency: '₹',
      pricingSlabs: slabs,
      rating: initial?.rating ?? 4.5,
      origin: form.origin,
      leadTimeDays: form.leadTimeDays,
      isFeatured: initial?.isFeatured,
      isNew: initial?.isNew,
      tags: initial?.tags,
    }
    onSave(product)
    onClose()
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontFamily: '"Bricolage Grotesque", serif', fontWeight: 700 }}>
        {initial ? 'Edit product' : 'Add product'}
      </DialogTitle>
      <DialogContent dividers>
        <Box className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
          <Box className="sm:col-span-2">
            <TextField label="Product name" value={form.name} onChange={str('name')} fullWidth size="small" />
          </Box>
          <TextField label="Category" value={form.category} onChange={str('category')} select fullWidth size="small">
            {categories.map((c) => (
              <MenuItem key={c} value={c}>
                {c}
              </MenuItem>
            ))}
          </TextField>
          <TextField label="Unit (e.g. sack, box)" value={form.unit} onChange={str('unit')} fullWidth size="small" />
          <TextField label="Base price (₹)" type="number" value={form.basePrice} onChange={num('basePrice')} fullWidth size="small" />
          <TextField label="MOQ" type="number" value={form.moq} onChange={num('moq')} fullWidth size="small" />
          <TextField label="Available stock" type="number" value={form.availableStock} onChange={num('availableStock')} fullWidth size="small" />
          <TextField label="Lead time (days)" type="number" value={form.leadTimeDays} onChange={num('leadTimeDays')} fullWidth size="small" />
          <Box className="sm:col-span-2">
            <TextField label="Short description" value={form.shortDescription} onChange={str('shortDescription')} fullWidth size="small" multiline minRows={2} />
          </Box>
        </Box>

        <Divider sx={{ my: 2.5 }} />
        <Typography sx={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.05em', color: 'var(--ink-500)', mb: 1 }}>
          AUTO-GENERATED LOT PRICING
        </Typography>
        <Box className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {slabs.map((s) => (
            <Box key={s.label} sx={{ p: 1.25, borderRadius: 2, border: '1px solid var(--ink-200)', bgcolor: 'var(--ink-50)' }}>
              <Typography sx={{ fontSize: 11, color: 'var(--ink-500)', fontWeight: 600 }}>{s.label}</Typography>
              <Typography className="tnum" sx={{ fontWeight: 800, fontSize: 15, color: 'var(--brand-700)' }}>
                {formatMoney(s.price)}
              </Typography>
            </Box>
          ))}
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} variant="outlined">
          Cancel
        </Button>
        <Button onClick={handleSave} variant="contained" disabled={!valid}>
          {initial ? 'Save changes' : 'Add product'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
