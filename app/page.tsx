import Header from '@/components/Header';
import KpiCards from '@/components/KpiCards';
import HumidityChart from '@/components/HumidityChart';
import SimulatorButton from '@/components/SimulatorButton';
import AlertsTable from '@/components/AlertsTable';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0f172a]">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        <KpiCards />
        <HumidityChart />
        <SimulatorButton />
        <AlertsTable />
      </main>
    </div>
  );
}
