import { useState, useMemo } from 'react'
import { Box, Typography, Button, TextField, IconButton, Tooltip } from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'
import type { GridColDef } from '@mui/x-data-grid'
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'
import TableCard from '@/components/admin/TableCard'
import { gridSx } from '@/components/admin/gridStyles'
import { useGetCategoriesQuery, useCreateCategoryMutation, useDeleteCategoryMutation } from '@/redux/api'
import type { Category } from '@/types'
import toast from 'react-hot-toast'

export default function CategoriesAdminPage() {
  const { data: categories, isLoading } = useGetCategoriesQuery()
  const [createCategory] = useCreateCategoryMutation()
  const [deleteCategory] = useDeleteCategoryMutation()
  const [search, setSearch] = useState('')
  const [newCategoryName, setNewCategoryName] = useState('')

  const filtered = useMemo(() => {
    if (!categories) return []
    const s = search.toLowerCase()
    return categories.filter((c) => c.name.toLowerCase().includes(s))
  }, [categories, search])

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
    } catch (err: any) {
      toast.error(err.data?.message || 'Failed to create category')
    }
  }

  const handleDeleteCategory = async (id: string) => {
    try {
      await deleteCategory(id).unwrap()
      toast.success('Category deleted successfully')
    } catch (err: any) {
      toast.error(err.data?.message || 'Failed to delete category')
    }
  }


  const columns: GridColDef<Category>[] = [
    {
      field: 'name',
      headerName: 'Category Name',
      flex: 1,
      minWidth: 200,
      renderCell: (params) => (
        <Typography sx={{ fontWeight: 600, fontSize: 14 }}>
          {params.row.name}
        </Typography>
      ),
    },
    {
      field: 'slug',
      headerName: 'Slug',
      width: 180,
      renderCell: (params) => <span className="tnum">{params.row.slug}</span>,
    },
    {
      field: 'productCount',
      headerName: 'Product Count',
      width: 150,
      renderCell: (params) => <span className="tnum">{params.row.productCount} products</span>,
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
          <Tooltip title="Delete">
            <IconButton size="small" onClick={() => handleDeleteCategory(p.row.id)} sx={{ color: 'var(--ink-500)' }}>
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

      {/* Categories Grid Table */}
      <TableCard
        title="Product Categories"
        count={filtered.length}
        search={search}
        onSearch={setSearch}
        searchPlaceholder="Search categories…"
      >
        <DataGrid
          rows={filtered}
          columns={columns}
          loading={isLoading}
          rowHeight={52}
          disableRowSelectionOnClick
          disableColumnMenu
          pageSizeOptions={[10, 25, 50]}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          sx={gridSx}
        />
      </TableCard>
    </Box>
  )
}
