import { useMemo } from 'react'
import type { ReactNode } from 'react'
import { Box, Typography, Button } from '@mui/material'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'
import FileDownloadRoundedIcon from '@mui/icons-material/FileDownloadRounded'
import { useGetSalesSeriesQuery } from '@/redux/api'
import { formatMoney, formatMoneyCompact } from '@/utils/format'
import { brand, ink } from '@/theme/theme'
import toast from 'react-hot-toast'

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

  const reportsData = useMemo(() => {
    if (!series) return []
    return series.map((pt, idx) => {
      const sale = pt.revenue
      const purchased = Math.round(sale * (0.68 + (idx % 3) * 0.05))
      const onArrival = Math.round(sale * (0.08 + (idx % 2) * 0.04))
      return {
        label: pt.label,
        sale,
        purchased,
        onArrival,
      }
    })
  }, [series])

  const tooltip = { borderRadius: 12, border: `1px solid ${ink[200]}`, fontSize: 13 }

  return (
    <Box className="flex flex-col gap-5">
      <Box className="flex justify-end">
        <Button variant="outlined" startIcon={<FileDownloadRoundedIcon />} onClick={() => toast.success('Report exported (demo)')}>
          Export report
        </Button>
      </Box>

      {/* Sale Trends Chart */}
      <Panel title="Sale Trends" subtitle="Monthly sales performance (Revenue)">
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={reportsData} margin={{ left: -8, right: 8, top: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={ink[100]} vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 12, fill: ink[500] }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={(v) => formatMoneyCompact(v).replace('₹', '')} tick={{ fontSize: 12, fill: ink[500] }} axisLine={false} tickLine={false} width={52} />
            <Tooltip contentStyle={tooltip} formatter={(v) => [formatMoney(Number(v)), 'Sale']} />
            <Legend wrapperStyle={{ fontSize: 12.5 }} />
            <Line type="monotone" dataKey="sale" name="Sale" stroke="#1C7C58" strokeWidth={3} dot={{ r: 3, fill: '#15694A' }} activeDot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </Panel>

      <Box className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Purchased Trends Chart */}
        <Panel title="Purchased Trends" subtitle="Monthly vendor purchase volume">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={reportsData} margin={{ left: -8, right: 8, top: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={ink[100]} vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 12, fill: ink[500] }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={(v) => formatMoneyCompact(v).replace('₹', '')} tick={{ fontSize: 12, fill: ink[500] }} axisLine={false} tickLine={false} width={52} />
              <Tooltip contentStyle={tooltip} formatter={(v) => [formatMoney(Number(v)), 'Purchased']} />
              <Legend wrapperStyle={{ fontSize: 12.5 }} />
              <Line type="monotone" dataKey="purchased" name="Purchased" stroke="#C9842F" strokeWidth={3} dot={{ r: 3, fill: '#A66A1F' }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </Panel>

        {/* On Arrival Trends Chart */}
        <Panel title="On Arrival Trends" subtitle="Monthly stock shipments on arrival">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={reportsData} margin={{ left: -8, right: 8, top: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={ink[100]} vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 12, fill: ink[500] }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={(v) => formatMoneyCompact(v).replace('₹', '')} tick={{ fontSize: 12, fill: ink[500] }} axisLine={false} tickLine={false} width={52} />
              <Tooltip contentStyle={tooltip} formatter={(v) => [formatMoney(Number(v)), 'On Arrival']} />
              <Legend wrapperStyle={{ fontSize: 12.5 }} />
              <Line type="monotone" dataKey="onArrival" name="On Arrival" stroke="#389B73" strokeWidth={3} dot={{ r: 3, fill: '#2A7254' }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </Panel>
      </Box>
    </Box>
  )
}
