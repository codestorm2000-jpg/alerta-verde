'use client';

import { useEffect, useState } from 'react';
import { FiDatabase, FiAlertTriangle, FiAlertCircle, FiTrendingUp } from 'react-icons/fi';
import { fetchKpis } from '@/lib/queries';
import type { KpiData } from '@/types';

export default function KpiCards() {
  const [kpis, setKpis] = useState<KpiData | null>(null);

  useEffect(() => {
    const load = () => fetchKpis().then(setKpis);
    load();
    const interval = setInterval(load, 10_000);
    return () => clearInterval(interval);
  }, []);

  if (!kpis) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-[#1e293b] border border-[#334155] rounded-xl p-5 animate-pulse h-28" />
        ))}
      </div>
    );
  }

  const hasAnomalies = kpis.anomaliasHoy > 0;

  const cards = [
    {
      icon: <FiDatabase className="text-[#32D04F]" />,
      label: 'Total lecturas',
      value: kpis.totalLecturas.toLocaleString(),
      accent: false,
    },
    {
      icon: <FiAlertTriangle className="text-[#f59e0b]" />,
      label: 'Anomalías hoy',
      value: kpis.anomaliasHoy.toLocaleString(),
      accent: hasAnomalies,
    },
    {
      icon: <FiAlertCircle className="text-[#ef4444]" />,
      label: 'Sensor crítico',
      value: kpis.sensorCritico,
      accent: hasAnomalies,
    },
    {
      icon: <FiTrendingUp className="text-[#3b82f6]" />,
      label: 'Tasa de anomalías',
      value: `${kpis.tasaAnomalias}%`,
      accent: false,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`bg-[#1e293b] border border-[#334155] rounded-xl p-5 flex items-center gap-4 ${
            card.accent ? 'border-l-4 border-l-[#ef4444]' : ''
          }`}
        >
          <span className="text-3xl">{card.icon}</span>

          <div>
            <p className="text-3xl font-bold text-[#f8fafc]">{card.value}</p>
            <p className="text-sm text-[#94a3b8]">{card.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
