const SENSORS = [
  { id: '20142fa1-a1f4-4239-9149-563646f67dae', code: 'sensor01', anomalyRate: 0.20 },
  { id: '032cd4a6-03c0-4f62-9588-812c89ce13fc', code: 'sensor02', anomalyRate: 0.42 },
  { id: '701f8dbf-20d0-455f-9aab-6af9a94e9ac6', code: 'sensor03', anomalyRate: 0.20 },
];

const ANOMALY_TYPES = ['sobretemperatura', 'baja_irradiancia', 'degradacion', 'humedad_critica'] as const;

type AnomalyType = (typeof ANOMALY_TYPES)[number];

function rand(min: number, max: number): number {
  return Math.round((min + Math.random() * (max - min)) * 10) / 10;
}

function pickRandom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

let cycleIndex = 0;

export function generateReading() {
  const sensor = SENSORS[cycleIndex % SENSORS.length];
  cycleIndex++;

  const isAnomaly = Math.random() < sensor.anomalyRate;

  const temperatura_ambiente_c = rand(24.0, 32.0);
  const temperatura_panel_c = isAnomaly ? rand(58.0, 72.0) : rand(35.0, 55.0);
  const humedad_pct = isAnomaly ? rand(76.0, 95.0) : rand(45.0, 72.0);
  const irradiancia_wm2 = isAnomaly ? rand(100.0, 350.0) : rand(400.0, 1000.0);
  const voltaje_dc_v = isAnomaly ? rand(280.0, 320.0) : rand(330.0, 380.0);
  const corriente_dc_a = isAnomaly ? rand(3.0, 6.0) : rand(7.0, 10.0);
  const potencia_kw = Math.round((voltaje_dc_v * corriente_dc_a) / 1000 * 100) / 100;
  const eficiencia_pct = isAnomaly ? rand(8.0, 13.0) : rand(15.0, 19.0);
  const probabilidad_anomalia = isAnomaly ? rand(0.55, 0.95) : rand(0.0, 0.30);
  const tipo_anomalia = isAnomaly ? pickRandom(ANOMALY_TYPES) : 'normal';

  return {
    reading: {
      sensor_id: sensor.id,
      temperatura_ambiente_c,
      temperatura_panel_c,
      humedad_pct,
      irradiancia_wm2,
      voltaje_dc_v,
      corriente_dc_a,
      potencia_kw,
      eficiencia_pct,
      anomalia: isAnomaly,
      tipo_anomalia,
      probabilidad_anomalia,
      usuario_registro: 'simulador_auto',
    },
    sensorCode: sensor.code,
    isAnomaly,
  };
}

const SEVERITY_MAP: Record<AnomalyType, string> = {
  sobretemperatura: 'alta',
  baja_irradiancia: 'media',
  degradacion: 'alta',
  humedad_critica: 'critica',
};

const MESSAGE_MAP: Record<AnomalyType, (val: number) => string> = {
  sobretemperatura: (t) =>
    `Temperatura del panel elevada (${t}°C). Posible fallo en ventilacion o acumulacion de calor.`,
  baja_irradiancia: (i) =>
    `Irradiancia muy baja (${i} W/m²). Posible obstruccion, suciedad o sombra sobre el panel.`,
  degradacion: (e) =>
    `Eficiencia degradada (${e}%). Revisar estado fisico del panel y conexiones.`,
  humedad_critica: (h) =>
    `Humedad critica detectada (${h}%). Riesgo de condensacion y corrosion en el panel.`,
};

const ACTION_MAP: Record<AnomalyType, string> = {
  sobretemperatura: 'Inspeccionar ventilacion del panel y limpieza de superficie.',
  baja_irradiancia: 'Verificar obstrucciones, limpiar paneles y revisar orientacion.',
  degradacion: 'Programar mantenimiento preventivo y revision de cableado.',
  humedad_critica: 'Activar protocolo de proteccion contra humedad. Revisar sellado.',
};

export function generateAlert(
  sensorId: string,
  lecturaId: string,
  tipoAnomalia: string,
  readingValues: { temperatura_panel_c: number; irradiancia_wm2: number; eficiencia_pct: number; humedad_pct: number }
) {
  const tipo = tipoAnomalia as AnomalyType;
  const valMap: Record<AnomalyType, number> = {
    sobretemperatura: readingValues.temperatura_panel_c,
    baja_irradiancia: readingValues.irradiancia_wm2,
    degradacion: readingValues.eficiencia_pct,
    humedad_critica: readingValues.humedad_pct,
  };

  return {
    sensor_id: sensorId,
    lectura_id: lecturaId,
    tipo: 'reactiva' as const,
    severidad: SEVERITY_MAP[tipo] ?? 'media',
    mensaje: MESSAGE_MAP[tipo]?.(valMap[tipo]) ?? `Anomalia detectada: ${tipoAnomalia}`,
    accion_recomendada: ACTION_MAP[tipo] ?? 'Revisar el sensor manualmente.',
    estado: 'pendiente' as const,
  };
}
