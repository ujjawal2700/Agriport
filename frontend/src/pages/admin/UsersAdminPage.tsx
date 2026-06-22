import { useEffect, useMemo, useState } from 'react'
import { DataGrid } from '@mui/x-data-grid'
import type { GridColDef } from '@mui/x-data-grid'
import { Box, Typography, Button, Avatar, Chip, Menu, MenuItem, ListItemIcon } from '@mui/material'
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded'
import BlockRoundedIcon from '@mui/icons-material/BlockRounded'
import PauseCircleRoundedIcon from '@mui/icons-material/PauseCircleRounded'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded'
import TableCard from '@/components/admin/TableCard'
import { gridSx } from '@/components/admin/gridStyles'
import { useGetAdminUsersQuery, useUpdateUserStatusMutation, useVerifyUserKycMutation } from '@/redux/api'
import { formatMoney, initials } from '@/utils/format'
import type { AdminUser, AccountStatus } from '@/types'
import toast from 'react-hot-toast'

const STATUS_META: Record<AccountStatus, { label: string; color: 'success' | 'warning' | 'error' }> = {
  active: { label: 'Active', color: 'success' },
  suspended: { label: 'Suspended', color: 'warning' },
  blocked: { label: 'Blocked', color: 'error' },
}

export default function UsersAdminPage() {
  const { data: serverUsers, isLoading } = useGetAdminUsersQuery()
  const [updateUserStatus] = useUpdateUserStatusMutation()
  const [verifyUserKyc] = useVerifyUserKycMutation()

  const [search, setSearch] = useState('')
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null)
  const [active, setActive] = useState<AdminUser | null>(null)

  const filtered = useMemo(() => {
    const s = search.toLowerCase()
    const list = serverUsers || []
    return list.filter((u) => u.name.toLowerCase().includes(s) || u.company.toLowerCase().includes(s) || u.email.toLowerCase().includes(s))
  }, [serverUsers, search])

  const setStatus = async (u: AdminUser, status: AccountStatus) => {
    try {
      await updateUserStatus({ id: u.id, status }).unwrap()
      toast.success(`${u.company} ${STATUS_META[status].label.toLowerCase()}`)
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to update user status')
    }
  }

  const verifyDocs = async (u: AdminUser) => {
    try {
      await verifyUserKyc({ id: u.id, kycVerified: true }).unwrap()
      toast.success(`Documents verified for ${u.company}`)
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to verify documents')
    }
  }

  const columns: GridColDef<AdminUser>[] = [
    {
      field: 'company',
      headerName: 'Business',
      flex: 1,
      minWidth: 240,
      renderCell: (p) => (
        <Box className="flex items-center gap-2" sx={{ height: '100%' }}>
          <Avatar sx={{ width: 38, height: 38, bgcolor: 'var(--brand-600)', fontSize: 13 }}>{initials(p.row.name)}</Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontWeight: 600, fontSize: 13.5, lineHeight: 1.2 }}>{p.row.company}</Typography>
            <Typography sx={{ fontSize: 12, color: 'var(--ink-500)' }}>{p.row.name} · {p.row.city}</Typography>
          </Box>
        </Box>
      ),
    },
    { field: 'email', headerName: 'Contact', width: 200, renderCell: (p) => (
      <Box>
        <Typography sx={{ fontSize: 13 }}>{p.row.email}</Typography>
        <Typography sx={{ fontSize: 12, color: 'var(--ink-500)' }} className="tnum">{p.row.mobile}</Typography>
      </Box>
    ) },
    { field: 'ordersCount', headerName: 'Orders', width: 90, renderCell: (p) => <span className="tnum">{p.row.ordersCount}</span> },
    { field: 'totalSpend', headerName: 'Total Spend', width: 130, renderCell: (p) => <span className="tnum" style={{ fontWeight: 700 }}>{formatMoney(p.row.totalSpend)}</span> },
    {
      field: 'docStatus',
      headerName: 'Docs',
      width: 110,
      renderCell: (p) => (
        <Chip
          size="small"
          icon={p.row.docStatus === 'verified' ? <VerifiedRoundedIcon sx={{ fontSize: 14 }} /> : undefined}
          label={p.row.docStatus === 'verified' ? 'Verified' : 'Pending'}
          color={p.row.docStatus === 'verified' ? 'success' : 'warning'}
          variant="outlined"
        />
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (p) => {
        const m = STATUS_META[p.row.status]
        return <Chip size="small" label={m.label} color={m.color} variant="outlined" />
      },
    },
    {
      field: 'actions',
      headerName: '',
      width: 56,
      sortable: false,
      filterable: false,
      align: 'right',
      headerAlign: 'right',
      renderCell: (p) => (
        <Button size="small" sx={{ minWidth: 0, p: 1 }} onClick={(e) => { setActive(p.row); setMenuAnchor(e.currentTarget) }}>
          <MoreVertRoundedIcon fontSize="small" />
        </Button>
      ),
    },
  ]

  return (
    <Box>
      <TableCard title="Customers" count={filtered.length} search={search} onSearch={setSearch} searchPlaceholder="Search by name, company, email…">
        <DataGrid
          rows={filtered}
          columns={columns}
          loading={isLoading}
          rowHeight={62}
          disableRowSelectionOnClick
          disableColumnMenu
          pageSizeOptions={[10, 25]}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          sx={gridSx}
        />
      </TableCard>

      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={() => setMenuAnchor(null)}>
        {active?.docStatus === 'pending' && (
          <MenuItem onClick={() => { if (active) verifyDocs(active); setMenuAnchor(null) }}>
            <ListItemIcon><VerifiedRoundedIcon fontSize="small" /></ListItemIcon>
            Verify documents
          </MenuItem>
        )}
        {active?.status !== 'active' && (
          <MenuItem onClick={() => { if (active) setStatus(active, 'active'); setMenuAnchor(null) }}>
            <ListItemIcon><CheckCircleRoundedIcon fontSize="small" /></ListItemIcon>
            Activate
          </MenuItem>
        )}
        {active?.status === 'active' && (
          <MenuItem onClick={() => { if (active) setStatus(active, 'suspended'); setMenuAnchor(null) }}>
            <ListItemIcon><PauseCircleRoundedIcon fontSize="small" /></ListItemIcon>
            Suspend
          </MenuItem>
        )}
        {active?.status !== 'blocked' && (
          <MenuItem sx={{ color: '#C0392B' }} onClick={() => { if (active) setStatus(active, 'blocked'); setMenuAnchor(null) }}>
            <ListItemIcon><BlockRoundedIcon fontSize="small" sx={{ color: 'inherit' }} /></ListItemIcon>
            Block account
          </MenuItem>
        )}
      </Menu>
    </Box>
  )
}
