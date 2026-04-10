'use client';

import { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { FiAlertTriangle, FiPercent, FiTag, FiCrosshair } from 'react-icons/fi';
import { fetchReportesData } from '@/lib/queries';
import type { AnomalyBySensor, AnomalyTypeCount, DailyAnomalyTrend, SensorEfficiency } from '@/types';

const CHART_TOOLTIP = {
  contentStyle: { backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8 },
  labelStyle: { color: '#94a3b8' },
  itemStyle: { color: '#f8fafc' },
};

export default function ReportesPage() {
  const [anomalyBySensor, setAnomalyBySensor] = useState<AnomalyBySensor[]>([]);
  const [anomalyTypes, setAnomalyTypes] = useState<AnomalyTypeCount[]>([]);
  const [dailyTrend, setDailyTrend] = useState<DailyAnomalyTrend[]>([]);
  const [sensorEff, setSensorEff] = useState<SensorEfficiency[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReportesData().then((d) => {
      setAnomalyBySensor(d.anomalyBySensor);
      setAnomalyTypes(d.anomalyTypes);
      setDailyTrend(d.dailyTrend);
      setSensorEff(d.sensorEfficiency);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-[#f8fafc]">Reportes de Anomalias</h1>
        <div className="h-96 flex items-center justify-center text-[#94a3b8]">
          Cargando reportes...
        </div>
      </div>
    );
  }

  const totalAnomalias = anomalyBySensor.reduce((s, r) => s + r.anomalias, 0);
  const totalLecturas = anomalyBySensor.reduce((s, r) => s + r.total, 0);
  const tasaGlobal = totalLecturas > 0 ? Math.round((totalAnomalias / totalLecturas) * 1000) / 10 : 0;
  const tipoMasComun = anomalyTypes[0]?.tipo?.replace('_', ' ') ?? '—';
  const sensorCritico = [...anomalyBySensor].sort((a, b) => b.tasa - a.tasa)[0]?.sensor ?? '—';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#f8fafc]">Reportes de Anomalias</h1>
        <p className="text-sm text-[#94a3b8] mt-1">
          Analisis basado en modelo Random Forest — la humedad es el predictor principal (+0.28 correlacion)
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#1e293b] border border-[#334155] rounded-xl p-5 flex items-center gap-4">
          <FiAlertTriangle className="text-2xl text-[#ef4444]" />
          <div>
            <p className="text-3xl font-bold text-[#f8fafc]">{totalAnomalias}</p>
            <p className="text-sm text-[#94a3b8]">Total anomalias</p>
          </div>
        </div>
        <div className="bg-[#1e293b] border border-[#334155] rounded-xl p-5 flex items-center gap-4">
          <FiPercent className="text-2xl text-[#f59e0b]" />
          <div>
            <p className="text-3xl font-bold text-[#f8fafc]">{tasaGlobal}%</p>
            <p className="text-sm text-[#94a3b8]">Tasa global</p>
          </div>
        </div>
        <div className="bg-[#1e293b] border border-[#334155] rounded-xl p-5 flex items-center gap-4">
          <FiTag className="text-2xl text-[#3b82f6]" />
          <div>
            <p className="text-3xl font-bold text-[#f8fafc] capitalize">{tipoMasComun}</p>
            <p className="text-sm text-[#94a3b8]">Tipo mas comun</p>
          </div>
        </div>
        <div className="bg-[#1e293b] border border-[#334155] rounded-xl p-5 flex items-center gap-4 border-l-4 border-l-[#ef4444]">
          <FiCrosshair className="text-2xl text-[#ef4444]" />
          <div>
            <p className="text-3xl font-bold text-[#f8fafc]">{sensorCritico}</p>
            <p className="text-sm text-[#94a3b8]">Sensor critico</p>
          </div>
        </div>
      </div>

      {/* Row 1: Two charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Anomalias por sensor */}
        <div className="bg-[#1e293b] border border-[#334155] rounded-xl p-5">
          <h2 className="text-lg font-semibold text-[#f8fafc] mb-1">Anomalias por sensor</h2>
          <p className="text-xs text-[#94a3b8] mb-4">Tasa de anomalias por ubicacion</p>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={anomalyBySensor}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="sensor" stroke="#94a3b8" fontSize={12} tick={{ fill: '#94a3b8' }} />
              <YAxis stroke="#94a3b8" fontSize={12} tick={{ fill: '#94a3b8' }} unit="%" />
              <Tooltip {...CHART_TOOLTIP} />
              <Bar dataKey="tasa" name="Tasa %" radius={[4, 4, 0, 0]}>
                {anomalyBySensor.map((entry) => (
                  <Cell
                    key={entry.sensor}
                    fill={entry.tasa > 30 ? '#ef4444' : '#32D04F'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Tipos de anomalia */}
        <div className="bg-[#1e293b] border border-[#334155] rounded-xl p-5">
          <h2 className="text-lg font-semibold text-[#f8fafc] mb-1">Tipos de anomalia</h2>
          <p className="text-xs text-[#94a3b8] mb-4">Distribucion por tipo de fallo detectado</p>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={anomalyTypes} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis type="number" stroke="#94a3b8" fontSize={12} tick={{ fill: '#94a3b8' }} />
              <YAxis
                dataKey="tipo"
                type="category"
                stroke="#94a3b8"
                fontSize={11}
                tick={{ fill: '#94a3b8' }}
                width={120}
                tickFormatter={(v: string) => v.replace('_', ' ')}
              />
              <Tooltip {...CHART_TOOLTIP} />
              <Bar dataKey="count" name="Cantidad" fill="#32D04F" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 2: Tendencia diaria */}
      <div className="bg-[#1e293b] border border-[#334155] rounded-xl p-5">
        <h2 className="text-lg font-semibold text-[#f8fafc] mb-1">Tendencia de anomalias — ultimos 7 dias</h2>
        <p className="text-xs text-[#94a3b8] mb-4">Lecturas totales vs anomalias por dia</p>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={dailyTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis
              dataKey="fecha"
              stroke="#94a3b8"
              fontSize={12}
              tick={{ fill: '#94a3b8' }}
              tickFormatter={(v: string) => v.slice(5)}
            />
            <YAxis stroke="#94a3b8" fontSize={12} tick={{ fill: '#94a3b8' }} />
            <Tooltip {...CHART_TOOLTIP} />
            <Bar dataKey="total" name="Total lecturas" fill="#334155" radius={[4, 4, 0, 0]} />
            <Bar dataKey="anomalias" name="Anomalias" fill="#ef4444" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Row 3: Eficiencia */}
      <div className="bg-[#1e293b] border border-[#334155] rounded-xl p-5">
        <h2 className="text-lg font-semibold text-[#f8fafc] mb-1">Eficiencia promedio por sensor</h2>
        <p className="text-xs text-[#94a3b8] mb-4">Porcentaje de eficiencia promedio de cada panel</p>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={sensorEff}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="sensor" stroke="#94a3b8" fontSize={12} tick={{ fill: '#94a3b8' }} />
            <YAxis stroke="#94a3b8" fontSize={12} tick={{ fill: '#94a3b8' }} unit="%" domain={[0, 20]} />
            <Tooltip {...CHART_TOOLTIP} />
            <Bar dataKey="avgEficiencia" name="Eficiencia %" fill="#32D04F" radius={[4, 4, 0, 0]}>
              {sensorEff.map((entry) => (
                <Cell
                  key={entry.sensor}
                  fill={entry.avgEficiencia < 14 ? '#ef4444' : '#32D04F'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
