'use client';

import { useEffect, useState } from 'react';
import { fetchAlertas } from '@/lib/queries';
import type { AlertaConSensor } from '@/types';

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'hace un momento';
  if (mins < 60) return `hace ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `hace ${hours}h`;
  return new Date(dateStr).toLocaleDateString('es-CO', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const tipoBadge: Record<string, string> = {
  reactiva: 'bg-blue-500/20 text-blue-400',
  predictiva: 'bg-purple-500/20 text-purple-400',
};

const severidadBadge: Record<string, string> = {
  baja: 'bg-gray-500/20 text-gray-400',
  media: 'bg-yellow-500/20 text-yellow-400',
  alta: 'bg-orange-500/20 text-orange-400',
  critica: 'bg-red-500/20 text-red-400',
};

const estadoBadge: Record<string, string> = {
  pendiente: 'bg-yellow-500/20 text-yellow-400',
  atendida: 'bg-green-500/20 text-green-400',
  descartada: 'bg-gray-500/20 text-gray-400',
};

function Badge({ text, className }: { text: string; className: string }) {
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${className}`}>
      {text}
    </span>
  );
}

export default function AlertsTable() {
  const [alertas, setAlertas] = useState<AlertaConSensor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = () =>
      fetchAlertas().then((data) => {
        setAlertas(data);
        setLoading(false);
      });
    load();
    const interval = setInterval(load, 10_000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-[#1e293b] border border-[#334155] rounded-xl p-5">
      <h2 className="text-xl font-bold text-[#f8fafc] mb-4">Alertas recientes</h2>
      {loading ? (
        <div className="h-40 flex items-center justify-center text-[#94a3b8]">
          Cargando alertas...
        </div>
      ) : alertas.length === 0 ? (
        <div className="h-40 flex items-center justify-center text-[#94a3b8]">
          Sin alertas recientes
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[#94a3b8] border-b border-[#334155]">
                <th className="text-left py-2 px-3">Fecha</th>
                <th className="text-left py-2 px-3">Sensor</th>
                <th className="text-left py-2 px-3">Tipo</th>
                <th className="text-left py-2 px-3">Severidad</th>
                <th className="text-left py-2 px-3">Mensaje</th>
                <th className="text-left py-2 px-3">Estado</th>
              </tr>
            </thead>
            <tbody>
              {alertas.map((alerta) => {
                const sensor = alerta.sensores as unknown as { codigo: string };
                return (
                  <tr key={alerta.id} className="border-b border-[#334155]/50 hover:bg-[#334155]/30">
                    <td className="py-2 px-3 text-[#94a3b8] whitespace-nowrap">
                      {timeAgo(alerta.created_at)}
                    </td>
                    <td className="py-2 px-3 text-[#f8fafc] font-mono">
                      {sensor?.codigo ?? '—'}
                    </td>
                    <td className="py-2 px-3">
                      <Badge text={alerta.tipo} className={tipoBadge[alerta.tipo] ?? ''} />
                    </td>
                    <td className="py-2 px-3">
                      <Badge text={alerta.severidad} className={severidadBadge[alerta.severidad] ?? ''} />
                    </td>
                    <td className="py-2 px-3 text-[#f8fafc] max-w-[200px]" title={alerta.mensaje}>
                      {alerta.mensaje?.length > 60
                        ? alerta.mensaje.slice(0, 60) + '...'
                        : alerta.mensaje}
                    </td>
                    <td className="py-2 px-3">
                      <Badge text={alerta.estado} className={estadoBadge[alerta.estado] ?? ''} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
