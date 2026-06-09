import { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Button,
  TextField,
  MenuItem,
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
  InputAdornment,
} from '@mui/material'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import EditRoundedIcon from '@mui/icons-material/EditRounded'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'
import AutoFixHighRoundedIcon from '@mui/icons-material/AutoFixHighRounded'

import { api, useGetCategoriesQuery, useGetCrmCustomersQuery } from '@/redux/api'
import { useAppDispatch } from '@/redux/hooks'
import { products as mockProducts } from '@/mocks/data'
import { generateSlabs } from '@/utils/pricing'
import type { Product, PricingSlab } from '@/types'
import toast from 'react-hot-toast'

const PACKING_TYPES = ['Cartoon', 'Basket']

const emptyForm = (): Partial<Product> => ({
  name: '',
  category: '',
  shortDescription: '',
  description: '',
  origin: '',
  unit: 'pcs',
  moq: 1,
  availableStock: 0,
  stockStatus: 'in_stock',
  basePrice: 0,
  leadTimeDays: 7,
  isNew: false,
  isFeatured: false,
  tags: [],
  specifications: {
    Grade: 'Imported',
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
  sizeVariants: [],
  weightVariant: undefined,
})

interface StockFormDialogProps {
  open: boolean
  onClose: () => void
  productToEdit: Product | null
  onSave?: (product: Product, mode: 'add' | 'update') => void
  formMode?: 'sale' | 'purchase' | 'arrival'
}

export default function StockFormDialog({ open, onClose, productToEdit, onSave, formMode }: StockFormDialogProps) {
  const { data: categories } = useGetCategoriesQuery()
  const { data: customers } = useGetCrmCustomersQuery()
  const dispatch = useAppDispatch()

  const [form, setForm] = useState<Partial<Product>>(emptyForm())
  const [tagsInput, setTagsInput] = useState('')
  const [uploadedImages, setUploadedImages] = useState<string[]>([])
  const [slabs, setSlabs] = useState<PricingSlab[]>([])

  // Inline Variant Editor State
  const [showInlineEditor, setShowInlineEditor] = useState(false)
  const [editingSizeIndex, setEditingSizeIndex] = useState<number | null>(null)

  // Size Variant Input Fields
  const [sizeInput, setSizeInput] = useState('')
  const [stockInput, setStockInput] = useState<number | ''>('')
  const [priceInput, setPriceInput] = useState<number | ''>('')

  // Weight Variant Input Fields
  const [netWeightInput, setNetWeightInput] = useState<number | ''>('')
  const [grossWeightInput, setGrossWeightInput] = useState<number | ''>('')

  const [selectedCustomerId, setSelectedCustomerId] = useState('')

  useEffect(() => {
    if (open) {
      setSelectedCustomerId('')
      if (productToEdit) {
        setForm({
          ...productToEdit,
          specifications: { ...productToEdit.specifications },
          sizePlaceholder: productToEdit.sizePlaceholder ?? '',
          containerOptionFull: productToEdit.containerOptionFull ?? '',
          containerOptionHalf: productToEdit.containerOptionHalf ?? '',
          showContainerOptions: productToEdit.showContainerOptions ?? true,
          sizeVariants: productToEdit.sizeVariants ?? [],
          weightVariant: productToEdit.weightVariant,
        })
        setTagsInput((productToEdit.tags ?? []).join(', '))
        setUploadedImages(productToEdit.images ?? [])
        setSlabs(productToEdit.pricingSlabs?.length ? productToEdit.pricingSlabs.map((s) => ({ ...s })) : generateSlabs(productToEdit.basePrice ?? 0))
      } else {
        setForm(emptyForm())
        setTagsInput('')
        setUploadedImages([])
        setSlabs(generateSlabs(0))
      }
      setShowInlineEditor(false)
      setEditingSizeIndex(null)
      setSizeInput('')
      setStockInput('')
      setPriceInput('')
      setNetWeightInput('')
      setGrossWeightInput('')
    }
  }, [open, productToEdit])

  const handleSaveSize = () => {
    const sizeVal = sizeInput.trim()
    if (!sizeVal) {
      toast.error('Size is required')
      return
    }
    const currentSizes = form.sizeVariants ?? []

    // Duplicate check
    const isDuplicate = currentSizes.some((v, idx) => {
      if (idx === editingSizeIndex) return false
      return v.size.toLowerCase() === sizeVal.toLowerCase()
    })
    if (isDuplicate) {
      toast.error('Duplicate sizes are not allowed.')
      return
    }

    // Max 6 limit check
    const sizeCount = currentSizes.filter((_, idx) => idx !== editingSizeIndex).length
    if (sizeCount >= 6) {
      toast.error('Maximum 6 size variants allowed.')
      return
    }

    if (stockInput === '' || stockInput < 0 || isNaN(Number(stockInput))) {
      toast.error('Available stock must be a non-negative number')
      return
    }
    if (priceInput === '' || priceInput < 0 || isNaN(Number(priceInput))) {
      toast.error('Price must be a non-negative number')
      return
    }

    const newSizeVar = {
      size: sizeVal,
      stock: Number(stockInput),
      price: Number(priceInput),
    }

    const updated = [...currentSizes]
    if (editingSizeIndex !== null) {
      updated[editingSizeIndex] = newSizeVar
    } else {
      updated.push(newSizeVar)
    }

    setForm((f) => ({ ...f, sizeVariants: updated }))

    setSizeInput('')
    setStockInput('')
    setPriceInput('')
    setEditingSizeIndex(null)
    toast.success(editingSizeIndex !== null ? 'Size variant updated' : 'Size variant added')
  }

  const handleSaveWeight = () => {
    if (netWeightInput === '' || netWeightInput < 0 || isNaN(Number(netWeightInput))) {
      toast.error('Net Weight must be a non-negative number')
      return
    }
    if (grossWeightInput === '' || grossWeightInput < 0 || isNaN(Number(grossWeightInput))) {
      toast.error('Gross Weight must be a non-negative number')
      return
    }

    const newWeightVar = {
      netWeight: Number(netWeightInput),
      grossWeight: Number(grossWeightInput),
    }

    setForm((f) => ({ ...f, weightVariant: newWeightVar }))

    setNetWeightInput('')
    setGrossWeightInput('')
    toast.success('Weight details saved')
  }

  const handleEditRow = (idx: number) => {
    const v = (form.sizeVariants ?? [])[idx]
    setSizeInput(v.size)
    setStockInput(v.stock)
    setPriceInput(v.price)
    setEditingSizeIndex(idx)

    if (idx === 0 && form.weightVariant) {
      setNetWeightInput(form.weightVariant.netWeight)
      setGrossWeightInput(form.weightVariant.grossWeight)
    } else {
      setNetWeightInput('')
      setGrossWeightInput('')
    }

    setShowInlineEditor(true)
  }

  const handleDeleteRow = (idx: number) => {
    const updatedSizes = (form.sizeVariants ?? []).filter((_, i) => i !== idx)
    let updatedWeight = form.weightVariant
    if (idx === 0) {
      updatedWeight = undefined
    }
    setForm((f) => ({ ...f, sizeVariants: updatedSizes, weightVariant: updatedWeight }))
    toast.success('Variant deleted')
  }

  const handleEditWeight = () => {
    const w = form.weightVariant
    if (w) {
      setNetWeightInput(w.netWeight)
      setGrossWeightInput(w.grossWeight)
      setShowInlineEditor(true)
    }
  }

  const handleDeleteWeight = () => {
    setForm((f) => ({ ...f, weightVariant: undefined }))
    toast.success('Weight details deleted')
  }

  // ── Pricing tier helpers ────────────────────────────────────────────────
  const setSlabField = (idx: number, key: keyof PricingSlab, val: PricingSlab[keyof PricingSlab]) =>
    setSlabs((prev) => prev.map((s, i) => (i === idx ? { ...s, [key]: val } : s)))

  const addSlab = () =>
    setSlabs((prev) => [...prev, { minQty: 1, maxQty: null, price: form.basePrice ?? 0, label: 'New tier' }])

  const removeSlab = (idx: number) => setSlabs((prev) => prev.filter((_, i) => i !== idx))

  const autoFillSlabs = () => setSlabs(generateSlabs(form.basePrice ?? 0))

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

  const setField = (key: keyof Product, val: unknown) =>
    setForm((f) => ({ ...f, [key]: val }))

  const setSpec = (key: string, val: string) =>
    setForm((f) => ({ ...f, specifications: { ...(f.specifications ?? {}), [key]: val } }))

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
    const finalSlabs: PricingSlab[] = slabs.length ? slabs : generateSlabs(base)

    let savedProduct: Product
    let saveMode: 'add' | 'update'

    if (productToEdit) {
      const updated: Product = {
        ...productToEdit,
        ...form,
        tags,
        images: uploadedImages,
        pricingSlabs: finalSlabs,
        specifications: {
          ...form.specifications,
          Grade: 'Imported',
          Origin: form.origin ?? form.specifications?.Origin ?? '',
        },
        sizePlaceholder: form.sizePlaceholder || undefined,
        containerOptionFull: form.containerOptionFull || undefined,
        containerOptionHalf: form.containerOptionHalf || undefined,
        showContainerOptions: form.showContainerOptions ?? true,
      } as Product

      const idx = mockProducts.findIndex((p) => p.id === productToEdit.id)
      if (idx !== -1) mockProducts[idx] = updated
      savedProduct = updated
      saveMode = 'update'
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
          Grade: 'Imported',
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
        pricingSlabs: finalSlabs,
        rating: 4.0,
        origin: form.origin ?? '',
        leadTimeDays: form.leadTimeDays ?? 7,
        isNew: form.isNew ?? false,
        isFeatured: form.isFeatured ?? false,
        tags,
        sizePlaceholder: form.sizePlaceholder || undefined,
        containerOptionFull: form.containerOptionFull || undefined,
        containerOptionHalf: form.containerOptionHalf || undefined,
        showContainerOptions: form.showContainerOptions ?? true,
        sizeVariants: form.sizeVariants ?? [],
        weightVariant: form.weightVariant,
      }
      mockProducts.unshift(newProduct)
      savedProduct = newProduct
      saveMode = 'add'
      toast.success(`"${newProduct.name}" added successfully`)
    }

    dispatch(api.util.invalidateTags(['Product']))
    onSave?.(savedProduct, saveMode)
    onClose()
  }

  const specs = form.specifications ?? {}

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth slotProps={{ paper: { sx: { borderRadius: 4 } } }}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
        <Typography sx={{ fontWeight: 700, fontSize: 18 }}>
          {productToEdit ? 'Edit Stock' : 'Add New Stock'}
        </Typography>
        <IconButton size="small" onClick={onClose}><CloseRoundedIcon /></IconButton>
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
              label="Origin (Country)"
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
            <Box className="flex gap-4">
              <FormControlLabel
                control={<Switch checked={form.isNew ?? false} onChange={(e) => setField('isNew', e.target.checked)} />}
                label={<Typography sx={{ fontSize: 13.5 }}>New Arrival</Typography>}
              />
              <FormControlLabel
                control={<Switch checked={form.isFeatured ?? false} onChange={(e) => setField('isFeatured', e.target.checked)} />}
                label={<Typography sx={{ fontSize: 13.5 }}>stock</Typography>}
              />
            </Box>
          </Box>
        </Box>

        <Divider />

        {formMode === 'purchase' && (
          <>
            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: 13.5, mb: 1.5, color: 'var(--ink-600)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Select Customer
              </Typography>
              <Box className="grid grid-cols-1 gap-3">
                <TextField
                  select
                  label="Select Customer (Company or Mobile)"
                  size="small"
                  fullWidth
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                >
                  {(customers ?? []).map((c) => (
                    <MenuItem key={c.id} value={c.id}>
                      {c.company} — {c.phone}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>
            </Box>
            <Divider />
          </>
        )}

        {formMode === 'arrival' && (
          <>
            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: 13.5, mb: 1.5, color: 'var(--ink-600)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Select Company
              </Typography>
              <Box className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <TextField
                  select
                  label="Select Company"
                  size="small"
                  fullWidth
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                >
                  {(customers ?? []).map((c) => (
                    <MenuItem key={c.id} value={c.id}>
                      {c.company}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>
            </Box>
            <Divider />
          </>
        )}

        {/* Requirements (Size & Count Variants) */}
        <Box>
          <Typography sx={{ fontWeight: 700, fontSize: 13.5, mb: 1.5, color: 'var(--ink-600)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            size and count
          </Typography>

          <Button
            variant="outlined"
            startIcon={<AddRoundedIcon />}
            onClick={() => {
              setShowInlineEditor(true)
              setSizeInput('')
              setStockInput('')
              setPriceInput('')
              setNetWeightInput('')
              setGrossWeightInput('')
              setEditingSizeIndex(null)
            }}
            sx={{ borderRadius: 2, fontWeight: 600, textTransform: 'none', mb: 2 }}
          >
            Add Variant
          </Button>

          {/* Inline Editor Form */}
          {showInlineEditor && (
            <Box
              sx={{
                p: 2,
                mb: 2.5,
                borderRadius: 2.5,
                border: '1px solid var(--brand-300)',
                bgcolor: 'var(--brand-50)',
                display: 'flex',
                flexDirection: 'column',
                gap: 2.5,
              }}
            >
              {/* Size Variant Section */}
              <Box>
                <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: 'var(--brand-700)', mb: 1 }}>
                  {editingSizeIndex !== null ? 'Edit Size Variant' : 'A. Size Variant'}
                </Typography>
                <Box className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <TextField
                    label="Available Size *"
                    placeholder="e.g. XL"
                    size="small"
                    fullWidth
                    value={sizeInput}
                    onChange={(e) => setSizeInput(e.target.value)}
                  />
                  <TextField
                    label="Available Stock *"
                    placeholder="e.g. 25"
                    size="small"
                    type="number"
                    fullWidth
                    value={stockInput}
                    onChange={(e) => setStockInput(e.target.value === '' ? '' : Number(e.target.value))}
                  />
                  <TextField
                    label={formMode === 'purchase' ? 'Purchased Price *' : 'Price *'}
                    placeholder="e.g. 499"
                    size="small"
                    type="number"
                    fullWidth
                    slotProps={{
                      input: {
                        startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                      },
                    }}
                    value={priceInput}
                    onChange={(e) => setPriceInput(e.target.value === '' ? '' : Number(e.target.value))}
                  />
                </Box>

                {/* Maximum 6 size variants check message */}
                {(form.sizeVariants ?? []).length >= 6 && editingSizeIndex === null && (
                  <Typography sx={{ fontSize: 11.5, color: '#c0392b', mt: 1, fontWeight: 600 }}>
                    Maximum 6 sizes allowed.
                  </Typography>
                )}

                <Box sx={{ display: 'flex', gap: 1.5, mt: 1.5 }}>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={handleSaveSize}
                    disabled={(form.sizeVariants ?? []).length >= 6 && editingSizeIndex === null}
                    sx={{ borderRadius: 1.5, fontWeight: 700, textTransform: 'none' }}
                  >
                    {editingSizeIndex !== null ? 'Update Size' : 'Save Size'}
                  </Button>
                </Box>
              </Box>

              <Divider />

              {/* Weight Variant Section */}
              <Box>
                <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: 'var(--brand-700)', mb: 1 }}>
                  B. Weight Variant
                </Typography>
                <Box className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <TextField
                    label="Net Weight *"
                    placeholder="e.g. 5"
                    size="small"
                    type="number"
                    fullWidth
                    slotProps={{
                      input: {
                        endAdornment: <InputAdornment position="end">/kg</InputAdornment>,
                      },
                    }}
                    value={netWeightInput}
                    onChange={(e) => setNetWeightInput(e.target.value === '' ? '' : Number(e.target.value))}
                  />
                  <TextField
                    label="Gross Weight *"
                    placeholder="e.g. 5.5"
                    size="small"
                    type="number"
                    fullWidth
                    slotProps={{
                      input: {
                        endAdornment: <InputAdornment position="end">/kg</InputAdornment>,
                      },
                    }}
                    value={grossWeightInput}
                    onChange={(e) => setGrossWeightInput(e.target.value === '' ? '' : Number(e.target.value))}
                  />
                </Box>
                <Box sx={{ display: 'flex', gap: 1.5, mt: 1.5 }}>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={handleSaveWeight}
                    sx={{ borderRadius: 1.5, fontWeight: 700, textTransform: 'none' }}
                  >
                    Save Weight
                  </Button>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 0.5 }}>
                <Button
                  variant="text"
                  size="small"
                  onClick={() => setShowInlineEditor(false)}
                  sx={{ color: 'var(--ink-500)', textTransform: 'none', fontWeight: 600 }}
                >
                  Close Editor
                </Button>
              </Box>
            </Box>
          )}

          {/* Display Saved Variants in a single Table */}
          {((form.sizeVariants && form.sizeVariants.length > 0) || form.weightVariant) && (
            <Box sx={{ mb: 2.5 }}>
              <Typography sx={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-500)', textTransform: 'uppercase', letterSpacing: '0.04em', mb: 1 }}>
                Saved Variants
              </Typography>
              <Box sx={{ border: '1px solid var(--ink-200)', borderRadius: 2, overflow: 'hidden', bgcolor: '#fff' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'var(--ink-50)', '& th': { fontWeight: 700, fontSize: 11, color: 'var(--ink-600)', borderColor: 'var(--ink-200)' } }}>
                      <TableCell>Size</TableCell>
                      <TableCell>Net Weight</TableCell>
                      <TableCell>Gross Weight</TableCell>
                      <TableCell>Stock</TableCell>
                      <TableCell>{formMode === 'purchase' ? 'Purchased Price' : 'Price'}</TableCell>
                      <TableCell align="right" sx={{ width: 80 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {/* Render Size Variants */}
                    {form.sizeVariants && form.sizeVariants.length > 0 ? (
                      form.sizeVariants.map((v, idx) => (
                        <TableRow key={`size-${idx}`} sx={{ '& td': { borderColor: 'var(--ink-100)', py: 0.5 } }}>
                          <TableCell sx={{ fontSize: 13, fontWeight: 600 }}>{v.size}</TableCell>
                          
                          {/* If weightVariant exists and this is the first size row, show netWeight & grossWeight */}
                          {idx === 0 && form.weightVariant ? (
                            <>
                              <TableCell sx={{ fontSize: 13 }}>{form.weightVariant.netWeight} kg</TableCell>
                              <TableCell sx={{ fontSize: 13 }}>{form.weightVariant.grossWeight} kg</TableCell>
                            </>
                          ) : (
                            <>
                              <TableCell sx={{ fontSize: 13, color: 'var(--ink-400)' }}>-</TableCell>
                              <TableCell sx={{ fontSize: 13, color: 'var(--ink-400)' }}>-</TableCell>
                            </>
                          )}

                          <TableCell sx={{ fontSize: 13 }}>{v.stock}</TableCell>
                          <TableCell sx={{ fontSize: 13, fontWeight: 600 }}>₹{v.price}</TableCell>
                          
                          <TableCell align="right">
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                              <IconButton size="small" onClick={() => handleEditRow(idx)} title="Edit Row" sx={{ color: 'var(--brand-600)', p: 0.5 }}>
                                <EditRoundedIcon sx={{ fontSize: 16 }} />
                              </IconButton>
                              <IconButton size="small" onClick={() => handleDeleteRow(idx)} title="Delete Row" sx={{ color: '#c0392b', p: 0.5 }}>
                                <DeleteOutlineRoundedIcon sx={{ fontSize: 16 }} />
                              </IconButton>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      /* If sizeVariants is empty but weightVariant exists, render weight row */
                      form.weightVariant && (
                        <TableRow sx={{ '& td': { borderColor: 'var(--ink-100)', py: 0.5 } }}>
                          <TableCell sx={{ fontSize: 13, color: 'var(--ink-400)' }}>-</TableCell>
                          <TableCell sx={{ fontSize: 13 }}>{form.weightVariant.netWeight} kg</TableCell>
                          <TableCell sx={{ fontSize: 13 }}>{form.weightVariant.grossWeight} kg</TableCell>
                          <TableCell sx={{ fontSize: 13, color: 'var(--ink-400)' }}>-</TableCell>
                          <TableCell sx={{ fontSize: 13, color: 'var(--ink-400)' }}>-</TableCell>
                          <TableCell align="right">
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                              <IconButton size="small" onClick={handleEditWeight} title="Edit Weight" sx={{ color: 'var(--brand-600)', p: 0.5 }}>
                                <EditRoundedIcon sx={{ fontSize: 16 }} />
                              </IconButton>
                              <IconButton size="small" onClick={handleDeleteWeight} title="Delete Weight" sx={{ color: '#c0392b', p: 0.5 }}>
                                <DeleteOutlineRoundedIcon sx={{ fontSize: 16 }} />
                              </IconButton>
                            </Box>
                          </TableCell>
                        </TableRow>
                      )
                    )}
                  </TableBody>
                </Table>
              </Box>
            </Box>
          )}

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
                  label="full container at port"
                  size="small"
                  fullWidth
                  placeholder="full container at port"
                  value={form.containerOptionFull ?? ''}
                  onChange={(e) => setField('containerOptionFull', e.target.value)}
                  helperText="Leave blank to use default"
                />
                <TextField
                  label="available at cold storage"
                  size="small"
                  fullWidth
                  placeholder="available at cold storage"
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
              slotProps={{
                input: {
                  readOnly: true,
                },
              }}
              value="Imported"
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

        <Divider />

        {/* Bulk Pricing Tiers */}
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
            <Typography sx={{ fontWeight: 700, fontSize: 13.5, color: 'var(--ink-600)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Bulk Pricing Tiers
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <TextField
                label="Base price (₹)"
                size="small"
                type="number"
                disabled
                value={form.basePrice ?? ''}
                onChange={(e) => setField('basePrice', Number(e.target.value))}
                sx={{ width: 140 }}
              />
              <Button
                size="small"
                variant="outlined"
                disabled
                startIcon={<AutoFixHighRoundedIcon />}
                onClick={autoFillSlabs}
                sx={{ borderRadius: 2, fontWeight: 600, textTransform: 'none', whiteSpace: 'nowrap' }}
              >
                Auto-fill from base
              </Button>
            </Box>
          </Box>
          <Typography sx={{ fontSize: 11.5, color: 'var(--ink-400)', mb: 1.5 }}>
            These wholesale tiers are shown on the customer product page. Leave Max Qty blank for the top "and above" tier.
          </Typography>

          <Table size="small">
            <TableHead>
              <TableRow sx={{ '& th': { fontWeight: 700, fontSize: 11, color: 'var(--ink-500)', textTransform: 'uppercase', letterSpacing: '0.04em', borderColor: 'var(--ink-200)' } }}>
                <TableCell sx={{ width: 90 }}>Min Qty</TableCell>
                <TableCell sx={{ width: 90 }}>Max Qty</TableCell>
                <TableCell sx={{ width: 110 }}>Price (₹)</TableCell>
                <TableCell>Label</TableCell>
                <TableCell align="right" sx={{ width: 48 }} />
              </TableRow>
            </TableHead>
            <TableBody>
              {slabs.map((s, idx) => (
                <TableRow key={idx} sx={{ '& td': { borderColor: 'var(--ink-100)', py: 0.75 } }}>
                  <TableCell>
                    <TextField
                      size="small"
                      type="number"
                      disabled
                      value={s.minQty}
                      onChange={(e) => setSlabField(idx, 'minQty', Number(e.target.value))}
                      sx={{ '& input': { py: 0.75 } }}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      size="small"
                      type="number"
                      placeholder="∞"
                      disabled
                      value={s.maxQty ?? ''}
                      onChange={(e) =>
                        setSlabField(idx, 'maxQty', e.target.value === '' ? null : Number(e.target.value))
                      }
                      sx={{ '& input': { py: 0.75 } }}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      size="small"
                      type="number"
                      disabled
                      value={s.price}
                      onChange={(e) => setSlabField(idx, 'price', Number(e.target.value))}
                      sx={{ '& input': { py: 0.75 } }}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      size="small"
                      fullWidth
                      placeholder="e.g. 11–50 units"
                      disabled
                      value={s.label}
                      onChange={(e) => setSlabField(idx, 'label', e.target.value)}
                      sx={{ '& input': { py: 0.75 } }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small" disabled onClick={() => removeSlab(idx)} sx={{ color: '#c0392b' }}>
                      <DeleteOutlineRoundedIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {slabs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 2, color: 'var(--ink-400)', fontSize: 12.5 }}>
                    No tiers yet — add one or auto-fill from the base price.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <Button
            size="small"
            disabled
            startIcon={<AddRoundedIcon />}
            onClick={addSlab}
            sx={{ mt: 1, borderRadius: 2, fontWeight: 600, textTransform: 'none' }}
          >
            Add tier
          </Button>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, gap: 1.5 }}>
        <Button variant="outlined" onClick={onClose} sx={{ borderRadius: 2.5 }}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSave} sx={{ borderRadius: 2.5, fontWeight: 700, px: 4 }}>
          Add Stock
        </Button>
      </DialogActions>
    </Dialog>
  )
}
