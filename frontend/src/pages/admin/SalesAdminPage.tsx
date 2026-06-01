import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { Box, Typography, Button, Chip, LinearProgress, Avatar, TextField, InputAdornment } from '@mui/material'
import CheckRoundedIcon from '@mui/icons-material/CheckRounded'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import PersonRoundedIcon from '@mui/icons-material/PersonRounded'
import EmptyState from '@/components/common/EmptyState'
import { useGetManagersQuery, useGetExecutiveApprovalsQuery } from '@/redux/api'
import { formatMoneyCompact, formatDate, initials } from '@/utils/format'
import type { ExecutiveApproval } from '@/types'
import toast from 'react-hot-toast'

function SectionCard({ title, subtitle, children, action }: { title: string; subtitle?: string; children: ReactNode; action?: ReactNode }) {
  return (
    <Box sx={{ borderRadius: 4, border: '1px solid var(--ink-200)', bgcolor: '#fff', p: 3 }}>
      <Box className="flex items-start justify-between mb-3">
        <Box>
          <Typography sx={{ fontWeight: 700, fontSize: 16 }}>{title}</Typography>
          {subtitle && <Typography sx={{ fontSize: 12.5, color: 'var(--ink-500)' }}>{subtitle}</Typography>}
        </Box>
        {action}
      </Box>
      {children}
    </Box>
  )
}

export default function SalesAdminPage() {
  const { data: managers } = useGetManagersQuery()
  const { data: serverApprovals } = useGetExecutiveApprovalsQuery()
  const [approvals, setApprovals] = useState<ExecutiveApproval[]>([])
  const [commission, setCommission] = useState(4)
  const [override, setOverride] = useState(1.5)

  useEffect(() => {
    if (serverApprovals) setApprovals(serverApprovals)
  }, [serverApprovals])

  const decide = (e: ExecutiveApproval, status: 'approved' | 'rejected') => {
    setApprovals((prev) => prev.map((a) => (a.id === e.id ? { ...a, status } : a)))
    toast.success(`${e.name} ${status}`)
  }

  const pending = approvals.filter((a) => a.status === 'pending')

  return (
    <Box className="flex flex-col gap-6">
      {/* Managers */}
      <SectionCard title="Sales managers" subtitle="Team performance vs. monthly target" action={<Button variant="contained" size="small">Add manager</Button>}>
        <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {managers?.map((m) => {
            const pct = Math.min(100, Math.round((m.revenue / m.target) * 100))
            return (
              <Box key={m.id} sx={{ p: 2.5, borderRadius: 3, border: '1px solid var(--ink-200)' }}>
                <Box className="flex items-center gap-2 mb-2.5">
                  <Avatar sx={{ width: 42, height: 42, bgcolor: 'var(--brand-700)', fontSize: 14 }}>{initials(m.name)}</Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: 14.5 }}>{m.name}</Typography>
                    <Typography sx={{ fontSize: 12.5, color: 'var(--ink-500)' }}>{m.region} region · {m.teamSize} executives</Typography>
                  </Box>
                  <Chip size="small" label={m.status} color={m.status === 'active' ? 'success' : 'warning'} variant="outlined" />
                </Box>
                <Box className="flex justify-between items-baseline mb-1">
                  <Typography className="tnum" sx={{ fontWeight: 800, fontSize: 18, fontFamily: '"Bricolage Grotesque", serif' }}>
                    {formatMoneyCompact(m.revenue)}
                  </Typography>
                  <Typography className="tnum" sx={{ fontSize: 12.5, color: 'var(--ink-500)' }}>
                    of {formatMoneyCompact(m.target)} · {pct}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={pct}
                  sx={{ height: 7, borderRadius: 99, bgcolor: 'var(--ink-100)', '& .MuiLinearProgress-bar': { borderRadius: 99, bgcolor: pct >= 90 ? 'var(--brand-500)' : '#C9842F' } }}
                />
              </Box>
            )
          })}
        </Box>
      </SectionCard>

      <Box className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Executive approvals */}
        <Box className="lg:col-span-2">
          <SectionCard title="Executive approvals" subtitle="New executives created by managers, awaiting your approval">
            {pending.length === 0 ? (
              <EmptyState icon={<PersonRoundedIcon fontSize="inherit" />} title="No pending approvals" description="New executive requests will appear here." />
            ) : (
              <Box className="flex flex-col gap-2.5">
                {pending.map((e) => (
                  <Box key={e.id} sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, borderRadius: 3, border: '1px solid var(--ink-200)' }}>
                    <Avatar sx={{ width: 40, height: 40, bgcolor: 'var(--ink-200)', color: 'var(--ink-700)', fontSize: 13 }}>{initials(e.name)}</Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ fontWeight: 700, fontSize: 14 }}>{e.name}</Typography>
                      <Typography sx={{ fontSize: 12.5, color: 'var(--ink-500)' }}>
                        Manager: {e.manager} · {e.region} · {formatDate(e.requestedOn)}
                      </Typography>
                    </Box>
                    <Button size="small" variant="contained" startIcon={<CheckRoundedIcon />} onClick={() => decide(e, 'approved')}>
                      Approve
                    </Button>
                    <Button size="small" variant="outlined" color="error" startIcon={<CloseRoundedIcon />} onClick={() => decide(e, 'rejected')}>
                      Reject
                    </Button>
                  </Box>
                ))}
              </Box>
            )}
          </SectionCard>
        </Box>

        {/* Incentive config */}
        <SectionCard title="Incentive configuration" subtitle="Dynamic commission structure">
          <Box className="flex flex-col gap-3">
            <TextField
              label="Sales commission"
              type="number"
              value={commission}
              onChange={(e) => setCommission(Number(e.target.value))}
              size="small"
              slotProps={{ input: { endAdornment: <InputAdornment position="end">%</InputAdornment> } }}
            />
            <TextField
              label="Manager override"
              type="number"
              value={override}
              onChange={(e) => setOverride(Number(e.target.value))}
              size="small"
              slotProps={{ input: { endAdornment: <InputAdornment position="end">%</InputAdornment> } }}
            />
            <Box sx={{ p: 2, borderRadius: 2.5, bgcolor: 'var(--brand-50)', border: '1px solid #9DD4BC' }}>
              <Typography sx={{ fontSize: 12.5, color: 'var(--brand-800)' }}>
                Executives earn <strong>{commission}%</strong> on personal sales. Managers receive a
                <strong> {override}%</strong> override on their team's revenue.
              </Typography>
            </Box>
            <Button variant="contained" onClick={() => toast.success('Incentive structure saved')}>
              Save structure
            </Button>
          </Box>
        </SectionCard>
      </Box>
    </Box>
  )
}
