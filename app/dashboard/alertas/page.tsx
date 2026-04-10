'use client';

import { useEffect, useState, useMemo } from 'react';
import { FiClock, FiCheckCircle, FiXCircle, FiCheck, FiX } from 'react-icons/fi';
import {
  fetchAlertasFull,
  fetchAlertaKpis,
  updateAlertaEstado,
} from '@/lib/queries';
import { useToast } from '@/components/ToastProvider';
import type { AlertaConSensor, AlertaKpis } from '@/types';

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
  atendida: 'bg-[#32D04F]/20 text-[#32D04F]',
  descartada: 'bg-gray-500/20 text-gray-400',
};

function Badge({ text, className }: { text: string; className: string }) {
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${className}`}>
      {text}
    </span>
  );
}

export default function AlertasPage() {
  const [alertas, setAlertas] = useState<AlertaConSensor[]>([]);
  const [kpis, setKpis] = useState<AlertaKpis | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterSensor, setFilterSensor] = useState('todos');
  const [filterSeveridad, setFilterSeveridad] = useState('todas');
  const [filterEstado, setFilterEstado] = useState('todos');
  const { addToast } = useToast();

  const load = () =>
    Promise.all([fetchAlertasFull(), fetchAlertaKpis()]).then(([a, k]) => {
      setAlertas(a);
      setKpis(k);
      setLoading(false);
    });

  useEffect(() => {
    load();
    const interval = setInterval(load, 10_000);
    return () => clearInterval(interval);
  }, []);

  const filtered = useMemo(() => {
    return alertas.filter((a) => {
      const sensor = (a.sensores as unknown as { codigo: string })?.codigo;
      if (filterSensor !== 'todos' && sensor !== filterSensor) return false;
      if (filterSeveridad !== 'todas' && a.severidad !== filterSeveridad) return false;
      if (filterEstado !== 'todos' && a.estado !== filterEstado) return false;
      return true;
    });
  }, [alertas, filterSensor, filterSeveridad, filterEstado]);

  const handleUpdateEstado = async (id: string, estado: 'atendida' | 'descartada') => {
    const ok = await updateAlertaEstado(id, estado);
    if (ok) {
      addToast(`Alerta marcada como ${estado}`, 'success');
      load();
    } else {
      addToast('Error al actualizar alerta', 'warning');
    }
  };

  const selectClass =
    'bg-[#0f172a] border border-[#334155] rounded-lg text-[#f8fafc] text-sm px-3 py-2 focus:outline-none focus:border-[#32D04F]';

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#f8fafc]">Centro de Alertas</h1>

      {/* KPI cards */}
      {kpis && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[#1e293b] border border-[#334155] rounded-xl p-5 flex items-center gap-4 border-l-4 border-l-[#f59e0b]">
            <FiClock className="text-2xl text-[#f59e0b]" />
            <div>
              <p className="text-3xl font-bold text-[#f8fafc]">{kpis.pendientes}</p>
              <p className="text-sm text-[#94a3b8]">Pendientes</p>
            </div>
          </div>
          <div className="bg-[#1e293b] border border-[#334155] rounded-xl p-5 flex items-center gap-4 border-l-4 border-l-[#32D04F]">
            <FiCheckCircle className="text-2xl text-[#32D04F]" />
            <div>
              <p className="text-3xl font-bold text-[#f8fafc]">{kpis.atendidas}</p>
              <p className="text-sm text-[#94a3b8]">Atendidas</p>
            </div>
          </div>
          <div className="bg-[#1e293b] border border-[#334155] rounded-xl p-5 flex items-center gap-4 border-l-4 border-l-[#94a3b8]">
            <FiXCircle className="text-2xl text-[#94a3b8]" />
            <div>
              <p className="text-3xl font-bold text-[#f8fafc]">{kpis.descartadas}</p>
              <p className="text-sm text-[#94a3b8]">Descartadas</p>
            </div>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="bg-[#1e293b] border border-[#334155] rounded-xl p-4 flex flex-wrap gap-3 items-center">
        <span className="text-sm text-[#94a3b8]">Filtrar:</span>
        <select value={filterSensor} onChange={(e) => setFilterSensor(e.target.value)} className={selectClass}>
          <option value="todos">Todos los sensores</option>
          <option value="sensor01">sensor01</option>
          <option value="sensor02">sensor02</option>
          <option value="sensor03">sensor03</option>
        </select>
        <select value={filterSeveridad} onChange={(e) => setFilterSeveridad(e.target.value)} className={selectClass}>
          <option value="todas">Todas las severidades</option>
          <option value="baja">Baja</option>
          <option value="media">Media</option>
          <option value="alta">Alta</option>
          <option value="critica">Critica</option>
        </select>
        <select value={filterEstado} onChange={(e) => setFilterEstado(e.target.value)} className={selectClass}>
          <option value="todos">Todos los estados</option>
          <option value="pendiente">Pendiente</option>
          <option value="atendida">Atendida</option>
          <option value="descartada">Descartada</option>
        </select>
        <span className="text-xs text-[#94a3b8] ml-auto">
          {filtered.length} alerta{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Tabla */}
      <div className="bg-[#1e293b] border border-[#334155] rounded-xl p-5">
        {loading ? (
          <div className="h-40 flex items-center justify-center text-[#94a3b8]">
            Cargando alertas...
          </div>
        ) : filtered.length === 0 ? (
          <div className="h-40 flex items-center justify-center text-[#94a3b8]">
            Sin alertas con estos filtros
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
                  <th className="text-left py-2 px-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((alerta) => {
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
                      <td className="py-2 px-3">
                        {alerta.estado === 'pendiente' && (
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleUpdateEstado(alerta.id, 'atendida')}
                              className="p-1.5 rounded-lg bg-[#32D04F]/20 text-[#32D04F] hover:bg-[#32D04F]/30 transition-colors"
                              title="Marcar atendida"
                            >
                              <FiCheck size={14} />
                            </button>
                            <button
                              onClick={() => handleUpdateEstado(alerta.id, 'descartada')}
                              className="p-1.5 rounded-lg bg-gray-500/20 text-gray-400 hover:bg-gray-500/30 transition-colors"
                              title="Descartar"
                            >
                              <FiX size={14} />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
