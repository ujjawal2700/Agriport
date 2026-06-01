import { Box, Typography } from '@mui/material'
import SellProductForm from '@/components/sales/SellProductForm'
import SectionCard from '@/components/common/SectionCard'
import StatusChip from '@/components/common/StatusChip'
import { useGetSalesRecordsQuery } from '@/redux/api'
import { formatMoney, formatDate } from '@/utils/format'

export default function SellingPage() {
  const { data: sales } = useGetSalesRecordsQuery()

  return (
    <Box className="flex flex-col gap-6">
      <SellProductForm />

      <SectionCard title="Recent sales" padded={false}>
        <Box sx={{ px: 3, pb: 1 }}>
          {sales?.map((s, i) => (
            <Box
              key={s.id}
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr auto', sm: '1fr 1.4fr 1fr auto' },
                alignItems: 'center',
                gap: 1.5,
                py: 1.5,
                borderTop: i === 0 ? 'none' : '1px solid var(--ink-100)',
              }}
            >
              <Box>
                <Typography className="tnum" sx={{ fontWeight: 700, fontSize: 13.5 }}>{s.ref}</Typography>
                <Typography sx={{ fontSize: 12, color: 'var(--ink-500)' }} className="tnum">{formatDate(s.date)}</Typography>
              </Box>
              <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                <Typography sx={{ fontSize: 13.5, fontWeight: 600 }}>{s.customer}</Typography>
                <Typography sx={{ fontSize: 12, color: 'var(--ink-500)' }}>{s.product}</Typography>
              </Box>
              <Box sx={{ display: { xs: 'none', sm: 'block' } }}><StatusChip kind="payment" value={s.paymentStatus} /></Box>
              <Typography className="tnum" sx={{ fontWeight: 700, fontSize: 14, textAlign: 'right' }}>{formatMoney(s.amount)}</Typography>
            </Box>
          ))}
        </Box>
      </SectionCard>
    </Box>
  )
}
