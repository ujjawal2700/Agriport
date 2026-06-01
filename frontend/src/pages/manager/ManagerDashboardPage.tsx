import { Box, Typography, Button, LinearProgress, Avatar } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import PaymentsRoundedIcon from '@mui/icons-material/PaymentsRounded'
import FlagRoundedIcon from '@mui/icons-material/FlagRounded'
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded'
import RedeemRoundedIcon from '@mui/icons-material/RedeemRounded'
import StatCard from '@/components/admin/StatCard'
import SectionCard from '@/components/common/SectionCard'
import StatusChip from '@/components/common/StatusChip'
import { useGetManagerStatsQuery, useGetSalesSeriesQuery, useGetExecutivesQuery, useGetSalesRecordsQuery } from '@/redux/api'
import { formatMoney, formatMoneyCompact, formatDate, initials } from '@/utils/format'
import { brand, ink } from '@/theme/theme'

export default function ManagerDashboardPage() {
  const { data: stats, isLoading } = useGetManagerStatsQuery()
  const { data: series } = useGetSalesSeriesQuery()
  const { data: execs } = useGetExecutivesQuery()
  const { data: sales } = useGetSalesRecordsQuery()

  const targetPct = stats ? Math.min(100, Math.round((stats.revenue / stats.target) * 100)) : 0
  const leaderboard = [...(execs ?? [])].filter((e) => e.status === 'active').sort((a, b) => b.sales - a.sales).slice(0, 5)

  return (
    <Box className="flex flex-col gap-6">
      <Box className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard loading={isLoading} label="Team Revenue (MTD)" value={formatMoneyCompact(stats?.revenue ?? 0)} delta={stats?.revenueDelta} icon={<PaymentsRoundedIcon />} />
        <StatCard loading={isLoading} label="Target Achieved" value={`${targetPct}%`} icon={<FlagRoundedIcon />} hint={stats ? `of ${formatMoneyCompact(stats.target)}` : ''} />
        <StatCard loading={isLoading} label="Team Size" value={(stats?.teamSize ?? 0).toString()} icon={<GroupsRoundedIcon />} hint={`${stats?.pending ?? 0} pending approval`} />
        <StatCard loading={isLoading} label="Incentive Earned" value={formatMoneyCompact(stats?.incentiveEarned ?? 0)} icon={<RedeemRoundedIcon />} hint="This month" />
      </Box>

      <Box className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Box className="lg:col-span-2">
          <SectionCard title="Team revenue trend" subtitle="Last 12 months">
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={series} margin={{ left: -12, right: 8, top: 8 }}>
                <defs>
                  <linearGradient id="mrev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={brand[500]} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={brand[500]} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={ink[100]} vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 12, fill: ink[500] }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={(v) => formatMoneyCompact(v).replace('₹', '')} tick={{ fontSize: 12, fill: ink[500] }} axisLine={false} tickLine={false} width={52} />
                <Tooltip formatter={(v) => [formatMoney(Number(v)), 'Revenue']} contentStyle={{ borderRadius: 12, border: `1px solid ${ink[200]}`, fontSize: 13 }} />
                <Area type="monotone" dataKey="revenue" stroke={brand[600]} strokeWidth={2.5} fill="url(#mrev)" />
              </AreaChart>
            </ResponsiveContainer>
          </SectionCard>
        </Box>

        <SectionCard title="Target progress" subtitle="Monthly goal">
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <Typography className="tnum" sx={{ fontFamily: '"Bricolage Grotesque", serif', fontWeight: 800, fontSize: 52, color: 'var(--brand-700)', lineHeight: 1 }}>
              {targetPct}%
            </Typography>
            <Typography sx={{ fontSize: 13.5, color: 'var(--ink-500)', mb: 2 }}>
              {formatMoney(stats?.revenue ?? 0)} of {formatMoney(stats?.target ?? 0)}
            </Typography>
            <LinearProgress variant="determinate" value={targetPct} sx={{ height: 10, borderRadius: 99, bgcolor: 'var(--ink-100)', '& .MuiLinearProgress-bar': { borderRadius: 99, bgcolor: 'var(--brand-500)' } }} />
            <Button component={RouterLink} to="/manager/selling" variant="contained" fullWidth sx={{ mt: 3 }}>
              Record a sale
            </Button>
          </Box>
        </SectionCard>
      </Box>

      <Box className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SectionCard title="Top performers" action={<Button component={RouterLink} to="/manager/team" size="small">View team</Button>}>
          <Box className="flex flex-col">
            {leaderboard.map((e, i) => {
              const pct = Math.min(100, Math.round((e.sales / e.target) * 100))
              return (
                <Box key={e.id} className="flex items-center gap-3" sx={{ py: 1.25, borderTop: i === 0 ? 'none' : '1px solid var(--ink-100)' }}>
                  <Typography className="tnum" sx={{ width: 18, fontWeight: 800, color: 'var(--ink-400)' }}>{i + 1}</Typography>
                  <Avatar sx={{ width: 34, height: 34, bgcolor: 'var(--brand-600)', fontSize: 12 }}>{initials(e.name)}</Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontWeight: 600, fontSize: 13.5 }}>{e.name}</Typography>
                    <Typography sx={{ fontSize: 12, color: 'var(--ink-500)' }}>{e.region} · {e.deals} deals</Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography className="tnum" sx={{ fontWeight: 700, fontSize: 13.5 }}>{formatMoneyCompact(e.sales)}</Typography>
                    <Typography className="tnum" sx={{ fontSize: 11.5, color: pct >= 100 ? 'var(--brand-600)' : 'var(--ink-500)' }}>{pct}% of target</Typography>
                  </Box>
                </Box>
              )
            })}
          </Box>
        </SectionCard>

        <SectionCard title="Recent sales" action={<Button component={RouterLink} to="/manager/analytics" size="small">Analytics</Button>}>
          <Box className="flex flex-col">
            {sales?.slice(0, 5).map((s, i) => (
              <Box key={s.id} className="flex items-center gap-2" sx={{ py: 1.25, borderTop: i === 0 ? 'none' : '1px solid var(--ink-100)' }}>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontWeight: 600, fontSize: 13.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.customer}</Typography>
                  <Typography sx={{ fontSize: 12, color: 'var(--ink-500)' }} className="tnum">{formatDate(s.date)} · {s.by}</Typography>
                </Box>
                <StatusChip kind="payment" value={s.paymentStatus} />
                <Typography className="tnum" sx={{ fontWeight: 700, fontSize: 13.5, minWidth: 78, textAlign: 'right' }}>{formatMoney(s.amount)}</Typography>
              </Box>
            ))}
          </Box>
        </SectionCard>
      </Box>
    </Box>
  )
}
