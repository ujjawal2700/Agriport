import { useEffect, useMemo, useState } from 'react'
import { DataGrid } from '@mui/x-data-grid'
import type { GridColDef } from '@mui/x-data-grid'
import { Box, Typography, Button, IconButton, Tooltip, TextField } from '@mui/material'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import EditRoundedIcon from '@mui/icons-material/EditRounded'
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'
import TableCard from '@/components/admin/TableCard'
import { gridSx } from '@/components/admin/gridStyles'
import ProductThumb from '@/components/common/ProductThumb'
import StatusChip from '@/components/common/StatusChip'
import ProductFormDialog from '@/components/admin/ProductFormDialog'
import ConfirmDialog from '@/components/admin/ConfirmDialog'
import {
  useGetProductsQuery,
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} from '@/redux/api'
import { formatMoney } from '@/utils/format'
import type { Product } from '@/types'
import toast from 'react-hot-toast'

export default function ProductsAdminPage() {
  const { data: serverProducts, isLoading } = useGetProductsQuery()
  const { data: categories, refetch: refetchCategories } = useGetCategoriesQuery()

  const [createCategory] = useCreateCategoryMutation()
  const [createProduct, { isLoading: isCreating }] = useCreateProductMutation()
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation()
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation()

  const [search, setSearch] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [deleting, setDeleting] = useState<Product | null>(null)
  const [newCategoryName, setNewCategoryName] = useState('')

  const filtered = useMemo(() => {
    const s = search.toLowerCase()
    const list = serverProducts || []
    return list.filter((p) => p.name.toLowerCase().includes(s) || p.category.toLowerCase().includes(s))
  }, [serverProducts, search])

  const categoryNames = useMemo(() => {
    return categories?.map((c) => c.name) ?? []
  }, [categories])

  const handleCreateCategory = async () => {
    const trimmed = newCategoryName.trim()
    if (!trimmed) {
      toast.error('Please enter a category name')
      return
    }
    if (categories?.some((c) => c.name.toLowerCase() === trimmed.toLowerCase())) {
      toast.error('Category already exists')
      return
    }

    try {
      await createCategory({ name: trimmed }).unwrap()
      setNewCategoryName('')
      toast.success(`Category "${trimmed}" created successfully`)
      refetchCategories()
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to create category')
    }
  }

  const handleSave = async (product: Product) => {
    const catDoc = categories?.find((c) => c.name === product.category)
    if (!catDoc) {
      toast.error('Selected category is invalid or not found')
      return
    }

    const priceSlabs = product.pricingSlabs.map((slab) => ({
      minQty: slab.minQty,
      unitPrice: slab.price,
    }))

    const payload = {
      name: product.name,
      category: catDoc.id, // Mongoose ObjectId
      unit: product.unit,
      moq: product.moq,
      stock: product.availableStock,
      priceSlabs,
      description: product.description || product.name,
      specs: product.specifications,
    }

    try {
      if (editing) {
        await updateProduct({ id: editing.id, ...payload }).unwrap()
        toast.success('Product updated successfully')
      } else {
        const generatedSku = product.name.replace(/[^a-zA-Z0-9]/g, '').slice(0, 4).toUpperCase() + '-' + Math.floor(1000 + Math.random() * 9000)
        await createProduct({ ...payload, sku: generatedSku }).unwrap()
        toast.success('Product added successfully')
      }
      setFormOpen(false)
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to save product')
    }
  }

  const handleDelete = async () => {
    if (!deleting) return
    try {
      await deleteProduct(deleting.id).unwrap()
      toast.success('Product deleted')
      setDeleting(null)
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to delete product')
    }
  }

  const columns: GridColDef<Product>[] = [
    {
      field: 'name',
      headerName: 'Product',
      flex: 1,
      minWidth: 260,
      renderCell: (params) => (
        <Box className="flex items-center gap-2 py-1" sx={{ height: '100%' }}>
          <Box sx={{ width: 40, height: 40, flexShrink: 0 }}>
            <ProductThumb id={params.row.id} name={params.row.name} rounded={8} />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontWeight: 600, fontSize: 13.5, lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {params.row.name}
            </Typography>
            <Typography sx={{ fontSize: 12, color: 'var(--ink-500)' }}>{params.row.category}</Typography>
          </Box>
        </Box>
      ),
    },
    {
      field: 'moq',
      headerName: 'MOQ',
      width: 90,
      renderCell: (p) => <span className="tnum">{p.row.moq} {p.row.unit}</span>,
    },
    {
      field: 'basePrice',
      headerName: 'Base Price',
      width: 120,
      renderCell: (p) => <span className="tnum" style={{ fontWeight: 700 }}>{formatMoney(p.row.basePrice)}</span>,
    },
    {
      field: 'availableStock',
      headerName: 'Stock',
      width: 110,
      renderCell: (p) => <span className="tnum">{p.row.availableStock.toLocaleString('en-IN')}</span>,
    },
    {
      field: 'stockStatus',
      headerName: 'Status',
      width: 130,
      renderCell: (p) => <StatusChip kind="stock" value={p.row.stockStatus} />,
    },
    {
      field: 'actions',
      headerName: '',
      width: 100,
      sortable: false,
      filterable: false,
      align: 'right',
      headerAlign: 'right',
      renderCell: (p) => (
        <Box>
          <Tooltip title="Edit">
            <IconButton
              size="small"
              onClick={() => {
                setEditing(p.row)
                setFormOpen(true)
              }}
            >
              <EditRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton size="small" onClick={() => setDeleting(p.row)} sx={{ color: 'var(--ink-500)' }}>
              <DeleteOutlineRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ]

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Create Category Section */}
      <Box sx={{ p: 3, bgcolor: '#fff', borderRadius: 4, border: '1px solid var(--ink-200)' }}>
        <Typography sx={{ fontWeight: 700, fontSize: 16, mb: 0.5 }}>Create Category</Typography>
        <Typography sx={{ fontSize: 12.5, color: 'var(--ink-500)', mb: 2 }}>
          Add a new product category to populate in the dropdown when adding or editing products.
        </Typography>
        <Box sx={{ display: 'flex', gap: 1.5, maxWidth: 500 }}>
          <TextField
            size="small"
            placeholder="Category name (e.g. Beverages)"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            fullWidth
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }}
          />
          <Button
            variant="contained"
            onClick={handleCreateCategory}
            sx={{ borderRadius: 2.5, px: 3, fontWeight: 700, whiteSpace: 'nowrap' }}
          >
            Create Category
          </Button>
        </Box>
      </Box>

      <TableCard
        title="Products"
        count={filtered.length}
        search={search}
        onSearch={setSearch}
        searchPlaceholder="Search products…"
        actions={
          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            onClick={() => {
              setEditing(null)
              setFormOpen(true)
            }}
          >
            Add product
          </Button>
        }
      >
        <DataGrid
          rows={filtered}
          columns={columns}
          loading={isLoading}
          rowHeight={60}
          disableRowSelectionOnClick
          disableColumnMenu
          pageSizeOptions={[10, 25, 50]}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          sx={gridSx}
        />
      </TableCard>

      <ProductFormDialog
        open={formOpen}
        initial={editing}
        categories={categoryNames}
        onClose={() => setFormOpen(false)}
        onSave={handleSave}
        loading={isCreating || isUpdating}
      />
      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete product?"
        message={
          <>
            This will remove <strong>{deleting?.name}</strong> from the catalog. This action cannot be undone.
          </>
        }
        confirmLabel="Delete"
        destructive
        onConfirm={handleDelete}
        onClose={() => setDeleting(null)}
        loading={isDeleting}
      />
    </Box>
  )
}
