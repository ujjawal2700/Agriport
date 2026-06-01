import type { ReactNode } from 'react'
import { Box, Typography, Button } from '@mui/material'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'
import FileDownloadRoundedIcon from '@mui/icons-material/FileDownloadRounded'
import { useGetSalesSeriesQuery, useGetCategorySalesQuery } from '@/redux/api'
import { formatMoney, formatMoneyCompact } from '@/utils/format'
import { brand, ink } from '@/theme/theme'
import toast from 'react-hot-toast'

const PIE_COLORS = ['#15694A', '#1C7C58', '#389B73', '#66B894', '#C9842F', '#9AA4B2']

function Panel({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <Box sx={{ borderRadius: 4, border: '1px solid var(--ink-200)', bgcolor: '#fff', p: 3 }}>
      <Typography sx={{ fontWeight: 700, fontSize: 16 }}>{title}</Typography>
      {subtitle && <Typography sx={{ fontSize: 12.5, color: 'var(--ink-500)', mb: 2 }}>{subtitle}</Typography>}
      <Box sx={{ mt: subtitle ? 0 : 2 }}>{children}</Box>
    </Box>
  )
}

export default function ReportsAdminPage() {
  const { data: series } = useGetSalesSeriesQuery()
  const { data: cats } = useGetCategorySalesQuery()
  const tooltip = { borderRadius: 12, border: `1px solid ${ink[200]}`, fontSize: 13 }

  return (
    <Box className="flex flex-col gap-5">
      <Box className="flex justify-end">
        <Button variant="outlined" startIcon={<FileDownloadRoundedIcon />} onClick={() => toast.success('Report exported (demo)')}>
          Export report
        </Button>
      </Box>

      <Panel title="Revenue & orders" subtitle="Combined monthly performance">
        <ResponsiveContainer width="100%" height={320}>
          <ComposedChart data={series} margin={{ left: -8, right: 8, top: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={ink[100]} vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 12, fill: ink[500] }} axisLine={false} tickLine={false} />
            <YAxis yAxisId="l" tickFormatter={(v) => formatMoneyCompact(v).replace('₹', '')} tick={{ fontSize: 12, fill: ink[500] }} axisLine={false} tickLine={false} width={52} />
            <YAxis yAxisId="r" orientation="right" tick={{ fontSize: 12, fill: ink[500] }} axisLine={false} tickLine={false} width={36} />
            <Tooltip contentStyle={tooltip} formatter={(v, n) => (n === 'Revenue' ? [formatMoney(Number(v)), 'Revenue'] : [Number(v), 'Orders'])} />
            <Legend wrapperStyle={{ fontSize: 13 }} />
            <Bar yAxisId="r" dataKey="orders" name="Orders" fill={brand[200]} radius={[5, 5, 0, 0]} maxBarSize={24} />
            <Line yAxisId="l" type="monotone" dataKey="revenue" name="Revenue" stroke={brand[600]} strokeWidth={2.5} dot={{ r: 3 }} />
          </ComposedChart>
        </ResponsiveContainer>
      </Panel>

      <Box className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Panel title="Category revenue share" subtitle="Distribution across product categories">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={cats} dataKey="value" nameKey="name" innerRadius={70} outerRadius={110} paddingAngle={2}>
                {cats?.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltip} formatter={(v) => formatMoney(Number(v))} />
              <Legend wrapperStyle={{ fontSize: 12.5 }} />
            </PieChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Revenue growth" subtitle="Month-over-month trend line">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={series} margin={{ left: -8, right: 8, top: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={ink[100]} vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 12, fill: ink[500] }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={(v) => formatMoneyCompact(v).replace('₹', '')} tick={{ fontSize: 12, fill: ink[500] }} axisLine={false} tickLine={false} width={52} />
              <Tooltip contentStyle={tooltip} formatter={(v) => [formatMoney(Number(v)), 'Revenue']} />
              <Line type="monotone" dataKey="revenue" stroke={brand[500]} strokeWidth={3} dot={{ r: 3, fill: brand[600] }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </Panel>
      </Box>
    </Box>
  )
}
