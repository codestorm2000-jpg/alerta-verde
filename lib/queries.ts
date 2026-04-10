import { supabase } from './supabase';
import type {
  KpiData, AlertaConSensor, ChartDataPoint,
  AnomalyBySensor, AnomalyTypeCount, DailyAnomalyTrend, SensorEfficiency, AlertaKpis, Tecnico,
} from '@/types';

export async function fetchKpis(): Promise<KpiData> {
  const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const last7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [totalRes, anomalias24hRes, tasaRes, critico7dRes] = await Promise.all([
    supabase.from('lecturas').select('*', { count: 'exact', head: true }),
    supabase
      .from('lecturas')
      .select('*', { count: 'exact', head: true })
      .eq('anomalia', true)
      .gte('fecha', last24h),
    supabase.from('lecturas').select('anomalia'),
    supabase
      .from('lecturas')
      .select('sensor_id, anomalia, sensores(codigo)')
      .gte('fecha', last7d),
  ]);

  const totalLecturas = totalRes.count ?? 0;
  let anomaliasHoy = anomalias24hRes.count ?? 0;

  // Calculate anomaly rate
  const tasaData = tasaRes.data ?? [];
  const tasaAnomalias =
    tasaData.length > 0
      ? Math.round(
          (tasaData.filter((r) => r.anomalia).length / tasaData.length) * 1000
        ) / 10
      : 0;

  // Find critical sensor in last 7 days
  const criticoData = critico7dRes.data ?? [];
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

  // If no anomalies in 24h, count from 7 days for display
  if (anomaliasHoy === 0) {
    anomaliasHoy = criticoData.filter((r) => r.anomalia).length;
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
    temperatura_ambiente_c: 48.5,
    temperatura_panel_c: 79.0,
    humedad_pct: 98.0,
    irradiancia_wm2: 940.0,
    voltaje_dc_v: 41.5,
    corriente_dc_a: 10.3,
    potencia_kw: 0.428,
    eficiencia_pct: 16.2,
    velocidad_viento_ms: 0.6,
    usuario_registro: 'simulador_pitch',
  });

  if (error) return { success: false, error: error.message };
  return { success: true };
}

// ── Reportes ──

export async function fetchReportesData(): Promise<{
  anomalyBySensor: AnomalyBySensor[];
  anomalyTypes: AnomalyTypeCount[];
  dailyTrend: DailyAnomalyTrend[];
  sensorEfficiency: SensorEfficiency[];
}> {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [allRes, typesRes, trendRes, effRes] = await Promise.all([
    supabase.from('lecturas').select('sensor_id, anomalia, sensores(codigo, ubicacion_nombre)'),
    supabase.from('lecturas').select('tipo_anomalia').eq('anomalia', true),
    supabase.from('lecturas').select('fecha, anomalia').gte('fecha', sevenDaysAgo),
    supabase.from('lecturas').select('eficiencia_pct, sensores(codigo, ubicacion_nombre)'),
  ]);

  // Anomalias por sensor
  const sensorMap: Record<string, { total: number; anomalias: number; ubicacion: string }> = {};
  for (const row of allRes.data ?? []) {
    const s = row.sensores as unknown as { codigo: string; ubicacion_nombre: string };
    const key = s?.codigo ?? row.sensor_id;
    if (!sensorMap[key]) sensorMap[key] = { total: 0, anomalias: 0, ubicacion: s?.ubicacion_nombre ?? '' };
    sensorMap[key].total++;
    if (row.anomalia) sensorMap[key].anomalias++;
  }
  const anomalyBySensor: AnomalyBySensor[] = Object.entries(sensorMap).map(([sensor, v]) => ({
    sensor,
    ubicacion: v.ubicacion,
    total: v.total,
    anomalias: v.anomalias,
    tasa: v.total > 0 ? Math.round((v.anomalias / v.total) * 1000) / 10 : 0,
  }));

  // Tipos de anomalia
  const typeCount: Record<string, number> = {};
  for (const row of typesRes.data ?? []) {
    const t = row.tipo_anomalia ?? 'desconocido';
    typeCount[t] = (typeCount[t] ?? 0) + 1;
  }
  const anomalyTypes: AnomalyTypeCount[] = Object.entries(typeCount)
    .map(([tipo, count]) => ({ tipo, count }))
    .sort((a, b) => b.count - a.count);

  // Tendencia diaria
  const dayMap: Record<string, { total: number; anomalias: number }> = {};
  for (const row of trendRes.data ?? []) {
    const day = row.fecha?.slice(0, 10) ?? '';
    if (!dayMap[day]) dayMap[day] = { total: 0, anomalias: 0 };
    dayMap[day].total++;
    if (row.anomalia) dayMap[day].anomalias++;
  }
  const dailyTrend: DailyAnomalyTrend[] = Object.entries(dayMap)
    .map(([fecha, v]) => ({ fecha, ...v }))
    .sort((a, b) => a.fecha.localeCompare(b.fecha));

  // Eficiencia por sensor
  const effMap: Record<string, { sum: number; count: number; ubicacion: string }> = {};
  for (const row of effRes.data ?? []) {
    const s = row.sensores as unknown as { codigo: string; ubicacion_nombre: string };
    const key = s?.codigo ?? '';
    if (!effMap[key]) effMap[key] = { sum: 0, count: 0, ubicacion: s?.ubicacion_nombre ?? '' };
    effMap[key].sum += row.eficiencia_pct ?? 0;
    effMap[key].count++;
  }
  const sensorEfficiency: SensorEfficiency[] = Object.entries(effMap).map(([sensor, v]) => ({
    sensor,
    ubicacion: v.ubicacion,
    avgEficiencia: v.count > 0 ? Math.round((v.sum / v.count) * 10) / 10 : 0,
  }));

  return { anomalyBySensor, anomalyTypes, dailyTrend, sensorEfficiency };
}

// ── Alertas (full) ──

export async function fetchAlertasFull(): Promise<AlertaConSensor[]> {
  const { data, error } = await supabase
    .from('alertas')
    .select('*, sensores(codigo)')
    .order('created_at', { ascending: false })
    .limit(100);
  if (error || !data) return [];
  return data as AlertaConSensor[];
}

export async function fetchAlertaKpis(): Promise<AlertaKpis> {
  const { data } = await supabase.from('alertas').select('estado');
  const rows = data ?? [];
  return {
    pendientes: rows.filter((r) => r.estado === 'pendiente').length,
    atendidas: rows.filter((r) => r.estado === 'atendida').length,
    descartadas: rows.filter((r) => r.estado === 'descartada').length,
    total: rows.length,
  };
}

export async function updateAlertaEstado(
  id: string,
  estado: 'pendiente' | 'atendida' | 'descartada'
): Promise<boolean> {
  const { error } = await supabase.from('alertas').update({ estado }).eq('id', id);
  return !error;
}

// ── Tecnicos ──

export async function fetchTecnicos(): Promise<Tecnico[]> {
  const { data, error } = await supabase
    .from('tecnicos')
    .select('*')
    .order('created_at', { ascending: true });
  if (error || !data) return [];
  return data as Tecnico[];
}

export async function updateTecnico(
  id: string,
  updates: Partial<Pick<Tecnico, 'nombre' | 'telegram_chat_id' | 'especialidad' | 'activo'>>
): Promise<boolean> {
  const { error } = await supabase.from('tecnicos').update(updates).eq('id', id);
  return !error;
}

export async function fetchAlertasPorSensor(): Promise<Record<string, number>> {
  const { data } = await supabase
    .from('alertas')
    .select('sensor_id, sensores(codigo)')
    .eq('estado', 'pendiente');
  const counts: Record<string, number> = {};
  for (const row of data ?? []) {
    const codigo = (row.sensores as unknown as { codigo: string })?.codigo ?? row.sensor_id;
    counts[codigo] = (counts[codigo] ?? 0) + 1;
  }
  return counts;
}
