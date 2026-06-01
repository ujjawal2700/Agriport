import { Box } from '@mui/material'
import { ResponsiveContainer, ComposedChart, Bar, Line, BarChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import SectionCard from '@/components/common/SectionCard'
import StatCard from '@/components/admin/StatCard'
import PaymentsRoundedIcon from '@mui/icons-material/PaymentsRounded'
import ShoppingCartRoundedIcon from '@mui/icons-material/ShoppingCartRounded'
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded'
import { useGetSalesSeriesQuery, useGetExecutivesQuery, useGetManagerStatsQuery } from '@/redux/api'
import { formatMoney, formatMoneyCompact } from '@/utils/format'
import { brand, ink } from '@/theme/theme'

export default function AnalyticsPage() {
  const { data: series } = useGetSalesSeriesQuery()
  const { data: execs } = useGetExecutivesQuery()
  const { data: stats } = useGetManagerStatsQuery()
  const tooltip = { borderRadius: 12, border: `1px solid ${ink[200]}`, fontSize: 13 }
  const teamData = (execs ?? []).filter((e) => e.status === 'active').map((e) => ({ name: e.name.split(' ')[0], sales: e.sales }))

  return (
    <Box className="flex flex-col gap-6">
      <Box className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Team Revenue (MTD)" value={formatMoneyCompact(stats?.revenue ?? 0)} delta={stats?.revenueDelta} icon={<PaymentsRoundedIcon />} />
        <StatCard label="Deals Closed" value={(stats?.deals ?? 0).toString()} delta={stats?.dealsDelta} icon={<ShoppingCartRoundedIcon />} />
        <StatCard label="Active Executives" value={(stats?.teamSize ?? 0).toString()} icon={<GroupsRoundedIcon />} />
      </Box>

      <SectionCard title="Revenue & deals" subtitle="Monthly performance">
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={series} margin={{ left: -8, right: 8, top: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={ink[100]} vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 12, fill: ink[500] }} axisLine={false} tickLine={false} />
            <YAxis yAxisId="l" tickFormatter={(v) => formatMoneyCompact(v).replace('₹', '')} tick={{ fontSize: 12, fill: ink[500] }} axisLine={false} tickLine={false} width={52} />
            <YAxis yAxisId="r" orientation="right" tick={{ fontSize: 12, fill: ink[500] }} axisLine={false} tickLine={false} width={32} />
            <Tooltip contentStyle={tooltip} formatter={(v, n) => (n === 'Revenue' ? [formatMoney(Number(v)), 'Revenue'] : [Number(v), 'Orders'])} />
            <Legend wrapperStyle={{ fontSize: 13 }} />
            <Bar yAxisId="r" dataKey="orders" name="Orders" fill={brand[200]} radius={[5, 5, 0, 0]} maxBarSize={24} />
            <Line yAxisId="l" type="monotone" dataKey="revenue" name="Revenue" stroke={brand[600]} strokeWidth={2.5} dot={{ r: 3 }} />
          </ComposedChart>
        </ResponsiveContainer>
      </SectionCard>

      <SectionCard title="Executive contribution" subtitle="Revenue by team member (MTD)">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={teamData} layout="vertical" margin={{ left: 20, right: 16, top: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={ink[100]} horizontal={false} />
            <XAxis type="number" tickFormatter={(v) => formatMoneyCompact(v).replace('₹', '')} tick={{ fontSize: 12, fill: ink[500] }} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 12.5, fill: ink[700] }} axisLine={false} tickLine={false} width={64} />
            <Tooltip contentStyle={tooltip} formatter={(v) => [formatMoney(Number(v)), 'Revenue']} cursor={{ fill: ink[50] }} />
            <Bar dataKey="sales" fill={brand[500]} radius={[0, 6, 6, 0]} maxBarSize={26} />
          </BarChart>
        </ResponsiveContainer>
      </SectionCard>
    </Box>
  )
}
