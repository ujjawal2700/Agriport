import { useEffect, useState } from 'react'
import {
  Box,
  Typography,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
} from '@mui/material'
import AddBoxRoundedIcon from '@mui/icons-material/AddBoxRounded'
import SectionCard from '@/components/common/SectionCard'
import EmptyState from '@/components/common/EmptyState'
import { useGetStockRequestsQuery, useGetCategoriesQuery } from '@/redux/api'
import { formatDate } from '@/utils/format'
import type { StockRequest, StockRequestType } from '@/types'
import toast from 'react-hot-toast'

const MANAGER = 'Arjun Desai'
const STATUS_COLOR: Record<StockRequest['status'], 'success' | 'warning' | 'error'> = {
  pending: 'warning',
  approved: 'success',
  rejected: 'error',
}
const TYPE_LABEL: Record<StockRequestType, string> = { add: 'Add stock', update: 'Update', new_product: 'New product' }

export default function StockRequestsPage() {
  const { data } = useGetStockRequestsQuery()
  const { data: categories } = useGetCategoriesQuery()
  const [rows, setRows] = useState<StockRequest[]>([])
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ productName: '', category: '', type: 'add' as StockRequestType, requestedChange: 0 })

  useEffect(() => {
    if (data) setRows(data.filter((r) => r.manager === MANAGER))
  }, [data])

  const raise = () => {
    const req: StockRequest = {
      id: `sr-${Date.now()}`,
      productName: form.productName.trim(),
      category: form.category || categories?.[0]?.name || 'General',
      manager: MANAGER,
      type: form.type,
      currentStock: 0,
      requestedChange: form.requestedChange,
      requestedOn: new Date().toISOString(),
      status: 'pending',
    }
    setRows((prev) => [req, ...prev])
    toast.success('Stock request raised — pending admin approval')
    setOpen(false)
    setForm({ productName: '', category: '', type: 'add', requestedChange: 0 })
  }

  return (
    <Box>
      <SectionCard
        title="My stock requests"
        subtitle="Inventory changes require admin approval before activation"
        action={
          <Button variant="contained" startIcon={<AddBoxRoundedIcon />} onClick={() => setOpen(true)}>
            Raise request
          </Button>
        }
        padded={false}
      >
        {rows.length === 0 ? (
          <EmptyState title="No stock requests yet" description="Raise a request to add or update inventory." />
        ) : (
          <Box sx={{ px: 3, pb: 1 }}>
            {rows.map((r, i) => (
              <Box
                key={r.id}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  py: 1.75,
                  borderTop: i === 0 ? 'none' : '1px solid var(--ink-100)',
                  flexWrap: 'wrap',
                }}
              >
                <Box sx={{ flex: 1, minWidth: 180 }}>
                  <Box className="flex items-center gap-2 flex-wrap">
                    <Typography sx={{ fontWeight: 600, fontSize: 14 }}>{r.productName}</Typography>
                    <Chip size="small" label={TYPE_LABEL[r.type]} variant="outlined" />
                  </Box>
                  <Typography sx={{ fontSize: 12.5, color: 'var(--ink-500)' }}>{r.category} · {formatDate(r.requestedOn)}</Typography>
                </Box>
                <Box sx={{ textAlign: 'center', px: 1 }}>
                  <Typography sx={{ fontSize: 11.5, color: 'var(--ink-500)', fontWeight: 600 }}>CHANGE</Typography>
                  <Typography className="tnum" sx={{ fontWeight: 800, fontSize: 15, color: r.requestedChange >= 0 ? 'var(--brand-700)' : '#922A20' }}>
                    {r.requestedChange >= 0 ? '+' : ''}{r.requestedChange}
                  </Typography>
                </Box>
                <Chip size="small" label={r.status} color={STATUS_COLOR[r.status]} variant="outlined" />
              </Box>
            ))}
          </Box>
        )}
      </SectionCard>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontFamily: '"Bricolage Grotesque", serif', fontWeight: 700 }}>Raise stock request</DialogTitle>
        <DialogContent dividers>
          <Box className="flex flex-col gap-3 pt-1">
            <TextField label="Product name" value={form.productName} onChange={(e) => setForm((f) => ({ ...f, productName: e.target.value }))} size="small" autoFocus />
            <TextField label="Category" value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} select size="small">
              {categories?.map((c) => (
                <MenuItem key={c.id} value={c.name}>{c.name}</MenuItem>
              ))}
            </TextField>
            <TextField label="Request type" value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as StockRequestType }))} select size="small">
              <MenuItem value="add">Add stock</MenuItem>
              <MenuItem value="update">Update stock</MenuItem>
              <MenuItem value="new_product">New product</MenuItem>
            </TextField>
            <TextField label="Quantity change" type="number" value={form.requestedChange} onChange={(e) => setForm((f) => ({ ...f, requestedChange: Number(e.target.value) }))} size="small" helperText="Use a negative number to reduce stock" />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setOpen(false)} variant="outlined">Cancel</Button>
          <Button onClick={raise} variant="contained" disabled={!form.productName.trim() || form.requestedChange === 0}>Submit request</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
