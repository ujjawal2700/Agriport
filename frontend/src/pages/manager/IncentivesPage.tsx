import IncentivesView from '@/components/sales/IncentivesView'
import { useGetManagerStatsQuery } from '@/redux/api'

export default function ManagerIncentivesPage() {
  const { data: stats } = useGetManagerStatsQuery()
  return <IncentivesView earned={stats?.incentiveEarned ?? 0} commissionPct={4} overridePct={1.5} role="manager" />
}
