import IncentivesView from '@/components/sales/IncentivesView'
import { useGetExecutiveStatsQuery } from '@/redux/api'

export default function ExecutiveIncentivesPage() {
  const { data: stats } = useGetExecutiveStatsQuery()
  return <IncentivesView earned={stats?.incentiveEarned ?? 0} commissionPct={4} role="executive" />
}
