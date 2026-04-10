import { supabase } from './supabase';
import type { KpiData, AlertaConSensor, ChartDataPoint } from '@/types';

export async function fetchKpis(): Promise<KpiData> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayISO = today.toISOString();

  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const [totalRes, anomaliasHoyRes, tasaRes, criticoRes] = await Promise.all([
    supabase.from('lecturas').select('*', { count: 'exact', head: true }),
    supabase
      .from('lecturas')
      .select('*', { count: 'exact', head: true })
      .eq('anomalia', true)
      .gte('fecha', todayISO),
    supabase.from('lecturas').select('anomalia'),
    supabase
      .from('lecturas')
      .select('sensor_id, anomalia, sensores(codigo)')
      .gte('fecha', yesterday),
  ]);

  const totalLecturas = totalRes.count ?? 0;
  const anomaliasHoy = anomaliasHoyRes.count ?? 0;

  // Calculate anomaly rate
  const tasaData = tasaRes.data ?? [];
  const tasaAnomalias =
    tasaData.length > 0
      ? Math.round(
          (tasaData.filter((r) => r.anomalia).length / tasaData.length) * 1000
        ) / 10
      : 0;

  // Find critical sensor in last 24h
  const criticoData = criticoRes.data ?? [];
  const sensorStats: Record<string, { total: number; anomalias: number; codigo: string }> = {};

  for (const row of criticoData) {
    const sid = row.sensor_id;
    const sensor = row.sensores as unknown as { codigo: string };
    if (!sensorStats[sid]) {
      sensorStats[sid] = { total: 0, anomalias: 0, codigo: sensor?.codigo ?? sid };
    }
    sensorStats[sid].total++;
    if (row.anomalia) sensorStats[sid].anomalias++;
  }

  let sensorCritico = '—';
  let maxRate = 0;
  for (const s of Object.values(sensorStats)) {
    const rate = s.total > 0 ? s.anomalias / s.total : 0;
    if (rate > maxRate) {
      maxRate = rate;
      sensorCritico = s.codigo;
    }
  }

  return { totalLecturas, anomaliasHoy, sensorCritico, tasaAnomalias };
}

export async function fetchChartData(): Promise<ChartDataPoint[]> {
  const { data, error } = await supabase
    .from('lecturas')
    .select(
      'fecha, humedad_pct, anomalia, tipo_anomalia, temperatura_ambiente_c, sensores(codigo)'
    )
    .order('fecha', { ascending: false })
    .limit(100);

  if (error || !data) return [];

  const reversed = [...data].reverse();

  const grouped: Record<string, ChartDataPoint> = {};

  for (const row of reversed) {
    const sensor = (row.sensores as unknown as { codigo: string })?.codigo;
    const date = new Date(row.fecha);
    const key = row.fecha;
    const formatted = `${date.getHours().toString().padStart(2, '0')}:${date
      .getMinutes()
      .toString()
      .padStart(2, '0')} ${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1)
      .toString()
      .padStart(2, '0')}`;

    if (!grouped[key]) {
      grouped[key] = { fecha: formatted, fechaRaw: row.fecha };
    }

    const point = grouped[key];
    if (sensor === 'sensor01') {
      point.sensor01 = row.humedad_pct;
      point.anomalia_sensor01 = row.anomalia;
      point.tipo_anomalia_sensor01 = row.tipo_anomalia;
      point.temp_sensor01 = row.temperatura_ambiente_c;
    } else if (sensor === 'sensor02') {
      point.sensor02 = row.humedad_pct;
      point.anomalia_sensor02 = row.anomalia;
      point.tipo_anomalia_sensor02 = row.tipo_anomalia;
      point.temp_sensor02 = row.temperatura_ambiente_c;
    } else if (sensor === 'sensor03') {
      point.sensor03 = row.humedad_pct;
      point.anomalia_sensor03 = row.anomalia;
      point.tipo_anomalia_sensor03 = row.tipo_anomalia;
      point.temp_sensor03 = row.temperatura_ambiente_c;
    }
  }

  return Object.values(grouped);
}

export async function fetchAlertas(): Promise<AlertaConSensor[]> {
  const { data, error } = await supabase
    .from('alertas')
    .select('*, sensores(codigo)')
    .order('created_at', { ascending: false })
    .limit(10);

  if (error || !data) return [];
  return data as AlertaConSensor[];
}

export async function fetchLastLectura(): Promise<string | null> {
  const { data } = await supabase
    .from('lecturas')
    .select('fecha')
    .order('fecha', { ascending: false })
    .limit(1);

  return data?.[0]?.fecha ?? null;
}

export async function insertSimulatedReading(): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase.from('lecturas').insert({
    sensor_id: '032cd4a6-03c0-4f62-9588-812c89ce13fc',
    temperatura_ambiente_c: 24.6,
    temperatura_panel_c: 38.2,
    humedad_pct: 80.0,
    irradiancia_wm2: 650.0,
    voltaje_dc_v: 342.5,
    corriente_dc_a: 7.8,
    potencia_kw: 2.67,
    eficiencia_pct: 14.2,
    anomalia: false,
    tipo_anomalia: 'normal',
    probabilidad_anomalia: 0.0,
    usuario_registro: 'simulador_pitch',
  });

  if (error) return { success: false, error: error.message };
  return { success: true };
}
