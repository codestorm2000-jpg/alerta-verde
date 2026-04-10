'use client';

import { useEffect, useState } from 'react';
import { FiPhone, FiMapPin, FiAlertTriangle, FiUsers, FiBell, FiNavigation, FiTool, FiUser } from 'react-icons/fi';
import { fetchTecnicos, fetchAlertasPorSensor } from '@/lib/queries';
import type { Tecnico } from '@/types';

// Map tecnicos to zones by UUID
const ZONE_MAP: Record<string, { zona: string; sensorCodigo: string; telefono: string }> = {
  '41a583df-683f-4b6f-8952-e3e40827803f': { zona: 'Zona Norte', sensorCodigo: 'sensor01', telefono: '+57 300 123 4567' },
  '73e2b3b5-0ad5-4bba-a290-61af4ee18900': { zona: 'Zona Centro', sensorCodigo: 'sensor02', telefono: '+57 301 234 5678' },
  '8b765137-2e72-4c29-81f4-50658c329de7': { zona: 'Todas las zonas', sensorCodigo: 'all', telefono: '+57 303 456 7890' },
};

function getInitials(nombre: string): string {
  return nombre
    .split(' ')
    .map((p) => p[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function getEspecialidadIcon(esp: string) {
  if (esp === 'ingeniero') return <FiUser size={14} />;
  return <FiTool size={14} />;
}

export default function TecnicosPage() {
  const [tecnicos, setTecnicos] = useState<Tecnico[]>([]);
  const [alertasPorSensor, setAlertasPorSensor] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = () =>
      Promise.all([fetchTecnicos(), fetchAlertasPorSensor()]).then(([t, a]) => {
        setTecnicos(t);
        setAlertasPorSensor(a);
        setLoading(false);
      });
    load();
    const interval = setInterval(load, 15_000);
    return () => clearInterval(interval);
  }, []);

  const totalPendientes = Object.values(alertasPorSensor).reduce((s, v) => s + v, 0);
  const zonaMasActiva = Object.entries(alertasPorSensor).sort((a, b) => b[1] - a[1])[0];

  const getAlertCount = (sensorCodigo: string) => {
    if (sensorCodigo === 'all') return totalPendientes;
    return alertasPorSensor[sensorCodigo] ?? 0;
  };

  const getTecnicoMeta = (tech: Tecnico) => {
    return ZONE_MAP[tech.id] ?? { zona: 'Sin asignar', sensorCodigo: 'all', telefono: '—' };
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#f8fafc]">Administrador de Tecnicos</h1>

      {/* Summary bar */}
      <div className="bg-[#1e293b] border border-[#334155] rounded-xl p-5 grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="flex items-center gap-3">
          <FiUsers className="text-xl text-[#32D04F]" />
          <div>
            <p className="text-2xl font-bold text-[#f8fafc]">{loading ? '...' : tecnicos.length}</p>
            <p className="text-xs text-[#94a3b8]">Tecnicos registrados</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <FiBell className="text-xl text-[#f59e0b]" />
          <div>
            <p className="text-2xl font-bold text-[#f8fafc]">{loading ? '...' : totalPendientes}</p>
            <p className="text-xs text-[#94a3b8]">Alertas pendientes</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <FiNavigation className="text-xl text-[#ef4444]" />
          <div>
            <p className="text-2xl font-bold text-[#f8fafc]">{zonaMasActiva?.[0] ?? '—'}</p>
            <p className="text-xs text-[#94a3b8]">Zona mas activa</p>
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="h-40 flex items-center justify-center text-[#94a3b8]">
          Cargando tecnicos...
        </div>
      ) : tecnicos.length === 0 ? (
        <div className="h-40 flex items-center justify-center text-[#94a3b8]">
          No hay tecnicos registrados
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tecnicos.map((tech) => {
            const meta = getTecnicoMeta(tech);
            const alerts = getAlertCount(meta.sensorCodigo);
            const enCampo = alerts > 0;
            const initials = getInitials(tech.nombre);

            return (
              <div
                key={tech.id}
                className="bg-[#1e293b] border border-[#334155] rounded-xl p-5 flex flex-col gap-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-[#32D04F]/20 text-[#32D04F] flex items-center justify-center text-sm font-bold">
                      {initials}
                    </div>
                    <div>
                      <p className="text-[#f8fafc] font-semibold">{tech.nombre}</p>
                      <div className="flex items-center gap-1.5 text-xs text-[#94a3b8]">
                        {getEspecialidadIcon(tech.especialidad)}
                        <span className="capitalize">{tech.especialidad}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!tech.activo && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/20 text-red-400">
                        Inactivo
                      </span>
                    )}
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        enCampo
                          ? 'bg-[#f59e0b]/20 text-[#f59e0b]'
                          : 'bg-[#32D04F]/20 text-[#32D04F]'
                      }`}
                    >
                      {enCampo ? 'En campo' : 'Disponible'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                  <div className="flex items-center gap-2 text-[#94a3b8]">
                    <FiPhone size={14} />
                    <span>{meta.telefono}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#94a3b8]">
                    <FiMapPin size={14} />
                    <span>{meta.zona}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FiAlertTriangle
                      size={14}
                      className={
                        alerts > 3
                          ? 'text-[#ef4444]'
                          : alerts > 0
                          ? 'text-[#f59e0b]'
                          : 'text-[#32D04F]'
                      }
                    />
                    <span
                      className={
                        alerts > 3
                          ? 'text-[#ef4444]'
                          : alerts > 0
                          ? 'text-[#f59e0b]'
                          : 'text-[#32D04F]'
                      }
                    >
                      {`${alerts} alerta${alerts !== 1 ? 's' : ''} pendiente${alerts !== 1 ? 's' : ''}`}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
