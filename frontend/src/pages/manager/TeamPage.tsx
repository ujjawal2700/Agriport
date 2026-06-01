import { useEffect, useState } from 'react'
import {
  Box,
  Typography,
  Button,
  Avatar,
  Chip,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material'
import PersonAddRoundedIcon from '@mui/icons-material/PersonAddRounded'
import SectionCard from '@/components/common/SectionCard'
import StatCard from '@/components/admin/StatCard'
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded'
import PendingActionsRoundedIcon from '@mui/icons-material/PendingActionsRounded'
import PaymentsRoundedIcon from '@mui/icons-material/PaymentsRounded'
import { useGetExecutivesQuery } from '@/redux/api'
import { formatMoney, formatMoneyCompact, initials } from '@/utils/format'
import type { Executive } from '@/types'
import toast from 'react-hot-toast'

export default function TeamPage() {
  const { data } = useGetExecutivesQuery()
  const [rows, setRows] = useState<Executive[]>([])
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [region, setRegion] = useState('')

  useEffect(() => {
    if (data) setRows(data)
  }, [data])

  const active = rows.filter((e) => e.status === 'active')
  const pending = rows.filter((e) => e.status === 'pending')
  const totalSales = active.reduce((s, e) => s + e.sales, 0)

  const addExecutive = () => {
    const exec: Executive = {
      id: `e-${Date.now()}`,
      name: name.trim(),
      region: region.trim() || 'Unassigned',
      sales: 0,
      target: 400000,
      deals: 0,
      status: 'pending',
      joinedOn: new Date().toISOString(),
    }
    setRows((prev) => [exec, ...prev])
    toast.success('Executive added — sent to admin for approval')
    setOpen(false)
    setName('')
    setRegion('')
  }

  return (
    <Box className="flex flex-col gap-6">
      <Box className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Active Executives" value={active.length.toString()} icon={<GroupsRoundedIcon />} />
        <StatCard label="Pending Approval" value={pending.length.toString()} icon={<PendingActionsRoundedIcon />} />
        <StatCard label="Team Revenue (MTD)" value={formatMoneyCompact(totalSales)} icon={<PaymentsRoundedIcon />} />
      </Box>

      <SectionCard
        title="My executives"
        subtitle="Performance against monthly targets"
        action={
          <Button variant="contained" startIcon={<PersonAddRoundedIcon />} onClick={() => setOpen(true)}>
            Add executive
          </Button>
        }
      >
        <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rows.map((e) => {
            const pct = e.target ? Math.min(100, Math.round((e.sales / e.target) * 100)) : 0
            return (
              <Box key={e.id} sx={{ p: 2.5, borderRadius: 3, border: '1px solid var(--ink-200)' }}>
                <Box className="flex items-center gap-2 mb-2.5">
                  <Avatar sx={{ width: 42, height: 42, bgcolor: e.status === 'pending' ? 'var(--ink-300)' : 'var(--brand-600)', fontSize: 14 }}>
                    {initials(e.name)}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: 14.5 }}>{e.name}</Typography>
                    <Typography sx={{ fontSize: 12.5, color: 'var(--ink-500)' }}>{e.region} · {e.deals} deals</Typography>
                  </Box>
                  <Chip
                    size="small"
                    label={e.status}
                    color={e.status === 'active' ? 'success' : e.status === 'pending' ? 'warning' : 'default'}
                    variant="outlined"
                  />
                </Box>
                {e.status === 'pending' ? (
                  <Typography sx={{ fontSize: 13, color: 'var(--ink-500)', fontStyle: 'italic' }}>
                    Awaiting admin approval before activation.
                  </Typography>
                ) : (
                  <>
                    <Box className="flex justify-between items-baseline mb-1">
                      <Typography className="tnum" sx={{ fontWeight: 800, fontSize: 17, fontFamily: '"Bricolage Grotesque", serif' }}>
                        {formatMoney(e.sales)}
                      </Typography>
                      <Typography className="tnum" sx={{ fontSize: 12.5, color: 'var(--ink-500)' }}>
                        {pct}% of {formatMoneyCompact(e.target)}
                      </Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={pct} sx={{ height: 7, borderRadius: 99, bgcolor: 'var(--ink-100)', '& .MuiLinearProgress-bar': { borderRadius: 99, bgcolor: pct >= 90 ? 'var(--brand-500)' : '#C9842F' } }} />
                  </>
                )}
              </Box>
            )
          })}
        </Box>
      </SectionCard>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontFamily: '"Bricolage Grotesque", serif', fontWeight: 700 }}>Add executive</DialogTitle>
        <DialogContent dividers>
          <Box className="flex flex-col gap-3 pt-1">
            <TextField label="Full name" value={name} onChange={(e) => setName(e.target.value)} size="small" autoFocus />
            <TextField label="Region" value={region} onChange={(e) => setRegion(e.target.value)} size="small" />
            <Typography sx={{ fontSize: 12.5, color: 'var(--ink-500)' }}>
              New executives require admin approval before they can start selling.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setOpen(false)} variant="outlined">Cancel</Button>
          <Button onClick={addExecutive} variant="contained" disabled={!name.trim()}>Add executive</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
