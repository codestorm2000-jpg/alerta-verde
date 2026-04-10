'use client';

import { useEffect, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { fetchChartData } from '@/lib/queries';
import type { ChartDataPoint } from '@/types';

function CustomDot(props: Record<string, unknown>) {
  const { cx, cy, payload, dataKey } = props as {
    cx: number; cy: number; payload: ChartDataPoint; dataKey: string;
  };
  const sensorKey = dataKey as 'sensor01' | 'sensor02' | 'sensor03';
  const anomKey = `anomalia_${sensorKey}` as keyof ChartDataPoint;
  if (payload[anomKey]) {
    return <circle cx={cx} cy={cy} r={6} fill="#ef4444" stroke="#fff" strokeWidth={1.5} />;
  }
  return <circle cx={cx} cy={cy} r={3} fill="transparent" />;
}

function CustomTooltip({ active, payload, label }: Record<string, unknown>) {
  if (!active || !payload) return null;
  const items = payload as Array<{
    name: string; value: number; color: string; payload: ChartDataPoint;
  }>;
  const row = items[0]?.payload;
  if (!row) return null;

  return (
    <div className="bg-[#1e293b] border border-[#334155] rounded-lg p-3 text-sm">
      <p className="text-[#94a3b8] mb-2">{label as string}</p>
      {items.map((item) => {
        const sKey = item.name as 'sensor01' | 'sensor02' | 'sensor03';
        const anomKey = `anomalia_${sKey}` as keyof ChartDataPoint;
        const tipoKey = `tipo_anomalia_${sKey}` as keyof ChartDataPoint;
        const tempKey = `temp_${sKey}` as keyof ChartDataPoint;
        return (
          <div key={item.name} className="mb-1">
            <span style={{ color: item.color }} className="font-semibold">
              {item.name}
            </span>
            : {item.value}% humedad
            {row[tempKey] != null && <span className="text-[#94a3b8]"> · {row[tempKey] as number}°C</span>}
            {row[anomKey] && (
              <span className="text-[#ef4444] ml-1">
                [{row[tipoKey] as string}]
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function HumidityChart() {
  const [data, setData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = () =>
      fetchChartData().then((d) => {
        setData(d);
        setLoading(false);
      });
    load();
    const interval = setInterval(load, 30_000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-[#1e293b] border border-[#334155] rounded-xl p-5">
      <h2 className="text-xl font-bold text-[#f8fafc] mb-1">
        Humedad por sensor — últimas 100 lecturas
      </h2>
      <p className="text-sm text-[#94a3b8] mb-4">
        La humedad es el predictor principal de anomalías (+0.28 correlación)
      </p>
      {loading ? (
        <div className="h-80 flex items-center justify-center text-[#94a3b8]">
          Cargando gráfica...
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis
              dataKey="fecha"
              stroke="#94a3b8"
              fontSize={12}
              tick={{ fill: '#94a3b8' }}
              interval="preserveStartEnd"
            />
            <YAxis
              domain={[0, 100]}
              stroke="#94a3b8"
              fontSize={12}
              tick={{ fill: '#94a3b8' }}
              label={{ value: 'Humedad %', angle: -90, position: 'insideLeft', fill: '#94a3b8' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line
              type="monotone"
              dataKey="sensor01"
              stroke="#10b981"
              strokeWidth={2}
              dot={<CustomDot />}
              connectNulls
            />
            <Line
              type="monotone"
              dataKey="sensor02"
              stroke="#ef4444"
              strokeWidth={2}
              dot={<CustomDot />}
              connectNulls
            />
            <Line
              type="monotone"
              dataKey="sensor03"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={<CustomDot />}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
