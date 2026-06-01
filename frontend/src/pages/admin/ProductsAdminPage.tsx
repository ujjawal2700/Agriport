import { useEffect, useMemo, useState } from 'react'
import { DataGrid } from '@mui/x-data-grid'
import type { GridColDef } from '@mui/x-data-grid'
import { Box, Typography, Button, IconButton, Tooltip } from '@mui/material'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import EditRoundedIcon from '@mui/icons-material/EditRounded'
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'
import TableCard from '@/components/admin/TableCard'
import { gridSx } from '@/components/admin/gridStyles'
import ProductThumb from '@/components/common/ProductThumb'
import StatusChip from '@/components/common/StatusChip'
import ProductFormDialog from '@/components/admin/ProductFormDialog'
import ConfirmDialog from '@/components/admin/ConfirmDialog'
import { useGetProductsQuery, useGetCategoriesQuery } from '@/redux/api'
import { formatMoney } from '@/utils/format'
import type { Product } from '@/types'
import toast from 'react-hot-toast'

export default function ProductsAdminPage() {
  const { data: serverProducts, isLoading } = useGetProductsQuery()
  const { data: categories } = useGetCategoriesQuery()
  const [rows, setRows] = useState<Product[]>([])
  const [search, setSearch] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [deleting, setDeleting] = useState<Product | null>(null)

  useEffect(() => {
    if (serverProducts) setRows(serverProducts)
  }, [serverProducts])

  const filtered = useMemo(() => {
    const s = search.toLowerCase()
    return rows.filter((p) => p.name.toLowerCase().includes(s) || p.category.toLowerCase().includes(s))
  }, [rows, search])

  const categoryNames = categories?.map((c) => c.name) ?? []

  const handleSave = (product: Product) => {
    setRows((prev) => {
      const exists = prev.some((p) => p.id === product.id)
      return exists ? prev.map((p) => (p.id === product.id ? product : p)) : [product, ...prev]
    })
    toast.success(editing ? 'Product updated' : 'Product added')
  }

  const handleDelete = () => {
    if (!deleting) return
    setRows((prev) => prev.filter((p) => p.id !== deleting.id))
    toast.success('Product deleted')
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
    <Box>
      <TableCard
        title="Products"
        count={rows.length}
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
      />
    </Box>
  )
}
