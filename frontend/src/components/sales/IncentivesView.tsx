import { Box, Typography } from '@mui/material'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell } from 'recharts'
import StatCard from '@/components/admin/StatCard'
import SectionCard from '@/components/common/SectionCard'
import RedeemRoundedIcon from '@mui/icons-material/RedeemRounded'
import PercentRoundedIcon from '@mui/icons-material/PercentRounded'
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded'
import { useGetIncentiveSeriesQuery } from '@/redux/api'
import { formatMoney, formatMoneyCompact } from '@/utils/format'
import { brand, ink } from '@/theme/theme'

interface Props {
  earned: number
  commissionPct: number
  overridePct?: number
  role: 'manager' | 'executive'
}

export default function IncentivesView({ earned, commissionPct, overridePct, role }: Props) {
  const { data: series } = useGetIncentiveSeriesQuery()
  const ytd = (series ?? []).reduce((s, p) => s + p.earned, 0)
  const lastTarget = series?.[series.length - 1]?.target ?? 0
  const lastEarned = series?.[series.length - 1]?.earned ?? earned
  const achieved = lastTarget ? Math.round((lastEarned / lastTarget) * 100) : 0

  return (
    <Box className="flex flex-col gap-6">
      <Box className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Earned This Month" value={formatMoneyCompact(earned)} icon={<RedeemRoundedIcon />} hint={`${achieved}% of target`} />
        <StatCard label="Year to Date" value={formatMoneyCompact(ytd)} icon={<EmojiEventsRoundedIcon />} />
        <StatCard label={role === 'manager' ? 'Commission + Override' : 'Commission Rate'} value={overridePct ? `${commissionPct}% + ${overridePct}%` : `${commissionPct}%`} icon={<PercentRoundedIcon />} hint={role === 'manager' ? 'on team revenue' : 'on personal sales'} />
      </Box>

      <SectionCard title="Earned vs target" subtitle="Monthly incentive performance">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={series} margin={{ left: -8, right: 8, top: 8 }} barGap={2}>
            <CartesianGrid strokeDasharray="3 3" stroke={ink[100]} vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 12, fill: ink[500] }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={(v) => formatMoneyCompact(v).replace('₹', '')} tick={{ fontSize: 12, fill: ink[500] }} axisLine={false} tickLine={false} width={48} />
            <Tooltip formatter={(v, n) => [formatMoney(Number(v)), n === 'earned' ? 'Earned' : 'Target']} contentStyle={{ borderRadius: 12, border: `1px solid ${ink[200]}`, fontSize: 13 }} />
            <Legend wrapperStyle={{ fontSize: 13 }} />
            <Bar dataKey="target" name="Target" fill={ink[200]} radius={[4, 4, 0, 0]} maxBarSize={26} />
            <Bar dataKey="earned" name="Earned" radius={[4, 4, 0, 0]} maxBarSize={26}>
              {series?.map((p, i) => (
                <Cell key={i} fill={p.earned >= p.target ? brand[500] : '#C9842F'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </SectionCard>

      <SectionCard title="Monthly breakdown" padded={false}>
        <Box sx={{ px: 3, pb: 1 }}>
          {series?.slice().reverse().map((p, i) => {
            const pct = p.target ? Math.round((p.earned / p.target) * 100) : 0
            return (
              <Box key={p.label} className="flex items-center justify-between" sx={{ py: 1.5, borderTop: i === 0 ? 'none' : '1px solid var(--ink-100)' }}>
                <Typography sx={{ fontWeight: 600, fontSize: 14 }}>{p.label}</Typography>
                <Box className="flex items-center gap-4">
                  <Typography className="tnum" sx={{ fontSize: 12.5, color: pct >= 100 ? 'var(--brand-600)' : '#A66A1F', fontWeight: 700 }}>
                    {pct}%
                  </Typography>
                  <Typography className="tnum" sx={{ fontWeight: 700, fontSize: 14, minWidth: 90, textAlign: 'right' }}>
                    {formatMoney(p.earned)}
                  </Typography>
                </Box>
              </Box>
            )
          })}
        </Box>
      </SectionCard>
    </Box>
  )
}
