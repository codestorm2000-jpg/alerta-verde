import { FiFileText } from 'react-icons/fi';

export default function ReportesPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#f8fafc]">Reportes</h1>
      <div className="bg-[#1e293b] border border-[#334155] rounded-xl p-12 text-center">
        <FiFileText className="text-5xl mb-4 mx-auto text-[#94a3b8]" />
        <h2 className="text-xl font-semibold text-[#f8fafc] mb-2">Proximamente</h2>
        <p className="text-[#94a3b8]">
          Los reportes de rendimiento y anomalias estaran disponibles pronto.
        </p>
      </div>
    </div>
  );
}
