import KpiCards from '@/components/KpiCards';
import HumidityChart from '@/components/HumidityChart';
import SimulatorButton from '@/components/SimulatorButton';
import AlertsTable from '@/components/AlertsTable';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <KpiCards />
      <HumidityChart />
      <SimulatorButton />
      <AlertsTable />
    </div>
  );
}
