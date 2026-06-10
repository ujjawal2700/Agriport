import { useState, useMemo } from 'react'
import { Box, Typography, Button, TextField, IconButton, Tooltip } from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'
import type { GridColDef } from '@mui/x-data-grid'
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'
import TableCard from '@/components/admin/TableCard'
import { gridSx } from '@/components/admin/gridStyles'
import { useGetCategoriesQuery } from '@/redux/api'
import { categories as mockCategories } from '@/mocks/data'
import type { Category } from '@/types'
import toast from 'react-hot-toast'

export default function CategoriesAdminPage() {
  const { data: categories, isLoading, refetch } = useGetCategoriesQuery()
  const [search, setSearch] = useState('')
  const [newCategoryName, setNewCategoryName] = useState('')

  const filtered = useMemo(() => {
    if (!categories) return []
    const s = search.toLowerCase()
    return categories.filter((c) => c.name.toLowerCase().includes(s))
  }, [categories, search])

  const handleCreateCategory = () => {
    const trimmed = newCategoryName.trim()
    if (!trimmed) {
      toast.error('Please enter a category name')
      return
    }
    if (mockCategories.some((c) => c.name.toLowerCase() === trimmed.toLowerCase())) {
      toast.error('Category already exists')
      return
    }

    // Add to global mock data
    mockCategories.push({
      id: `c-${Date.now()}`,
      name: trimmed,
      slug: trimmed.toLowerCase().replace(/\s+/g, '-'),
      productCount: 0,
      icon: 'folder',
    })

    setNewCategoryName('')
    toast.success(`Category "${trimmed}" created successfully`)
    refetch()
  }

  const handleDeleteCategory = (id: string) => {
    const idx = mockCategories.findIndex((c) => c.id === id)
    if (idx !== -1) {
      const name = mockCategories[idx].name
      mockCategories.splice(idx, 1)
      toast.success(`Category "${name}" deleted`)
      refetch()
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
