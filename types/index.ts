export interface Sensor {
  id: string;
  codigo: string;
  ubicacion_nombre: string;
  latitud: number;
  longitud: number;
  potencia_nominal_kw: number;
}

export interface Lectura {
  id: string;
  sensor_id: string;
  fecha: string;
  irradiancia_wm2: number;
  temperatura_panel_c: number;
  temperatura_ambiente_c: number;
  humedad_pct: number;
  voltaje_dc_v: number;
  corriente_dc_a: number;
  potencia_kw: number;
  eficiencia_pct: number;
  anomalia: boolean;
  tipo_anomalia: string;
  probabilidad_anomalia: number;
  usuario_registro: string;
  created_at: string;
}

export interface LecturaConSensor extends Lectura {
  sensores: { codigo: string };
}

export interface Alerta {
  id: string;
  sensor_id: string;
  lectura_id: string;
  tipo: 'reactiva' | 'predictiva';
  severidad: 'baja' | 'media' | 'alta' | 'critica';
  mensaje: string;
  accion_recomendada: string;
  estado: 'pendiente' | 'atendida' | 'descartada';
  created_at: string;
}

export interface AlertaConSensor extends Alerta {
  sensores: { codigo: string };
}

export interface KpiData {
  totalLecturas: number;
  anomaliasHoy: number;
  sensorCritico: string;
  tasaAnomalias: number;
}

export interface ChartDataPoint {
  fecha: string;
  fechaRaw: string;
  sensor01?: number;
  sensor02?: number;
  sensor03?: number;
  anomalia_sensor01?: boolean;
  anomalia_sensor02?: boolean;
  anomalia_sensor03?: boolean;
  tipo_anomalia_sensor01?: string;
  tipo_anomalia_sensor02?: string;
  tipo_anomalia_sensor03?: string;
  temp_sensor01?: number;
  temp_sensor02?: number;
  temp_sensor03?: number;
}

export interface AnomalyBySensor {
  sensor: string;
  ubicacion: string;
  total: number;
  anomalias: number;
  tasa: number;
}

export interface AnomalyTypeCount {
  tipo: string;
  count: number;
}

export interface DailyAnomalyTrend {
  fecha: string;
  anomalias: number;
  total: number;
}

export interface SensorEfficiency {
  sensor: string;
  ubicacion: string;
  avgEficiencia: number;
}

export interface AlertaKpis {
  pendientes: number;
  atendidas: number;
  descartadas: number;
  total: number;
}

export interface Tecnico {
  id: string;
  nombre: string;
  telegram_chat_id: string | null;
  especialidad: string;
  activo: boolean;
  created_at: string;
}
