import { Box, Typography, Button, LinearProgress, Chip } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import PaymentsRoundedIcon from '@mui/icons-material/PaymentsRounded'
import FlagRoundedIcon from '@mui/icons-material/FlagRounded'
import ShoppingCartRoundedIcon from '@mui/icons-material/ShoppingCartRounded'
import RedeemRoundedIcon from '@mui/icons-material/RedeemRounded'
import PhoneRoundedIcon from '@mui/icons-material/PhoneRounded'
import StorefrontRoundedIcon from '@mui/icons-material/StorefrontRounded'
import EmailRoundedIcon from '@mui/icons-material/EmailRounded'
import type { ReactNode } from 'react'
import StatCard from '@/components/admin/StatCard'
import SectionCard from '@/components/common/SectionCard'
import StatusChip from '@/components/common/StatusChip'
import EmptyState from '@/components/common/EmptyState'
import { useGetExecutiveStatsQuery, useGetFollowUpsQuery, useGetSalesRecordsQuery } from '@/redux/api'
import { formatMoney, formatMoneyCompact, fromNow } from '@/utils/format'
import type { FollowUp } from '@/types'

const FU_ICON: Record<FollowUp['type'], ReactNode> = {
  call: <PhoneRoundedIcon sx={{ fontSize: 18 }} />,
  visit: <StorefrontRoundedIcon sx={{ fontSize: 18 }} />,
  email: <EmailRoundedIcon sx={{ fontSize: 18 }} />,
}

export default function ExecutiveDashboardPage() {
  const { data: stats, isLoading } = useGetExecutiveStatsQuery()
  const { data: followUps } = useGetFollowUpsQuery()
  const { data: sales } = useGetSalesRecordsQuery()

  const targetPct = stats ? Math.min(100, Math.round((stats.revenue / stats.target) * 100)) : 0
  const pending = (followUps ?? []).filter((f) => !f.done)
  const mySales = (sales ?? []).filter((s) => s.by === 'Rahul Verma')

  return (
    <Box className="flex flex-col gap-6">
      <Box className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard loading={isLoading} label="My Sales (MTD)" value={formatMoneyCompact(stats?.revenue ?? 0)} delta={stats?.revenueDelta} icon={<PaymentsRoundedIcon />} />
        <StatCard loading={isLoading} label="Target Achieved" value={`${targetPct}%`} icon={<FlagRoundedIcon />} hint={stats ? `of ${formatMoneyCompact(stats.target)}` : ''} />
        <StatCard loading={isLoading} label="Deals Closed" value={(stats?.deals ?? 0).toString()} delta={stats?.dealsDelta} icon={<ShoppingCartRoundedIcon />} />
        <StatCard loading={isLoading} label="Incentive Earned" value={formatMoneyCompact(stats?.incentiveEarned ?? 0)} icon={<RedeemRoundedIcon />} hint="This month" />
      </Box>

      <Box className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Box className="lg:col-span-2">
          <SectionCard title="Today's follow-ups" subtitle="Customer activity & scheduled touchpoints" action={<Button component={RouterLink} to="/executive/customers" size="small">All customers</Button>}>
            {pending.length === 0 ? (
              <EmptyState title="All caught up" description="No pending follow-ups right now." />
            ) : (
              <Box className="flex flex-col">
                {pending.map((f, i) => {
                  const overdue = new Date(f.dueOn) < new Date()
                  return (
                    <Box key={f.id} className="flex items-center gap-3" sx={{ py: 1.5, borderTop: i === 0 ? 'none' : '1px solid var(--ink-100)' }}>
                      <Box sx={{ width: 36, height: 36, borderRadius: 2, display: 'grid', placeItems: 'center', bgcolor: 'var(--brand-50)', color: 'var(--brand-700)' }}>
                        {FU_ICON[f.type]}
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography sx={{ fontWeight: 600, fontSize: 14 }}>{f.company}</Typography>
                        <Typography sx={{ fontSize: 12.5, color: 'var(--ink-500)' }}>{f.note}</Typography>
                      </Box>
                      <Chip size="small" label={overdue ? 'Overdue' : fromNow(f.dueOn)} color={overdue ? 'error' : 'default'} variant="outlined" />
                    </Box>
                  )
                })}
              </Box>
            )}
          </SectionCard>
        </Box>

        <SectionCard title="My target" subtitle="This month">
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <Typography className="tnum" sx={{ fontFamily: '"Bricolage Grotesque", serif', fontWeight: 800, fontSize: 52, color: 'var(--brand-700)', lineHeight: 1 }}>
              {targetPct}%
            </Typography>
            <Typography sx={{ fontSize: 13.5, color: 'var(--ink-500)', mb: 2 }}>
              {formatMoney(stats?.revenue ?? 0)} of {formatMoney(stats?.target ?? 0)}
            </Typography>
            <LinearProgress variant="determinate" value={targetPct} sx={{ height: 10, borderRadius: 99, bgcolor: 'var(--ink-100)', '& .MuiLinearProgress-bar': { borderRadius: 99, bgcolor: 'var(--brand-500)' } }} />
            <Button component={RouterLink} to="/executive/sales" variant="contained" fullWidth sx={{ mt: 3 }}>
              New sale
            </Button>
          </Box>
        </SectionCard>
      </Box>

      <SectionCard title="My recent sales" padded={false}>
        <Box sx={{ px: 3, pb: 1 }}>
          {mySales.length === 0 ? (
            <Box sx={{ py: 3 }}>
              <Typography sx={{ textAlign: 'center', color: 'var(--ink-500)', fontSize: 14 }}>No sales recorded yet.</Typography>
            </Box>
          ) : (
            mySales.map((s, i) => (
              <Box key={s.id} sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr auto', sm: '1fr 1.4fr auto auto' }, alignItems: 'center', gap: 1.5, py: 1.5, borderTop: i === 0 ? 'none' : '1px solid var(--ink-100)' }}>
                <Typography className="tnum" sx={{ fontWeight: 700, fontSize: 13.5 }}>{s.ref}</Typography>
                <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                  <Typography sx={{ fontSize: 13.5, fontWeight: 600 }}>{s.customer}</Typography>
                  <Typography sx={{ fontSize: 12, color: 'var(--ink-500)' }}>{s.product}</Typography>
                </Box>
                <StatusChip kind="payment" value={s.paymentStatus} />
                <Typography className="tnum" sx={{ fontWeight: 700, fontSize: 14, textAlign: 'right', minWidth: 78 }}>{formatMoney(s.amount)}</Typography>
              </Box>
            ))
          )}
        </Box>
      </SectionCard>
    </Box>
  )
}
