'use client';

import { useEffect, useState, useRef } from 'react';
import { FiPlay, FiPause, FiActivity } from 'react-icons/fi';
import { supabase } from '@/lib/supabase';
import { generateReading, generateAlert } from '@/lib/simulator';
import { useToast } from '@/components/ToastProvider';

export default function AutoSimulator() {
  const [isRunning, setIsRunning] = useState(false);
  const [count, setCount] = useState(0);
  const [lastSensor, setLastSensor] = useState<string | null>(null);
  const { addToast } = useToast();
  const runningRef = useRef(false);

  useEffect(() => {
    runningRef.current = isRunning;
  }, [isRunning]);

  useEffect(() => {
    if (!isRunning) return;

    const run = async () => {
      if (!runningRef.current) return;

      const { reading, sensorCode, isAnomaly } = generateReading();

      const { data, error } = await supabase
        .from('lecturas')
        .insert(reading)
        .select('id')
        .single();

      if (error) {
        addToast(`Error insertando lectura: ${error.message}`, 'warning');
        return;
      }

      setCount((c) => c + 1);
      setLastSensor(sensorCode);

      if (isAnomaly && data?.id) {
        const alert = generateAlert(reading.sensor_id, data.id, reading.tipo_anomalia, {
          temperatura_panel_c: reading.temperatura_panel_c,
          irradiancia_wm2: reading.irradiancia_wm2,
          eficiencia_pct: reading.eficiencia_pct,
          humedad_pct: reading.humedad_pct,
        });

        await supabase.from('alertas').insert(alert);

        addToast(
          `Anomalia en ${sensorCode}: ${reading.tipo_anomalia.replace('_', ' ')} — humedad ${reading.humedad_pct}%`,
          'anomaly'
        );
      }
    };

    run();
    const interval = setInterval(run, 60_000);
    return () => clearInterval(interval);
  }, [isRunning, addToast]);

  return (
    <div className="bg-[#1e293b] border border-[#334155] rounded-xl p-5">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <FiActivity className={`text-xl ${isRunning ? 'text-[#32D04F]' : 'text-[#94a3b8]'}`} />
          <div>
            <h3 className="text-sm font-semibold text-[#f8fafc]">Simulacion automatica</h3>
            <p className="text-xs text-[#94a3b8]">
              {isRunning ? (
                <>
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#32D04F] animate-pulse mr-1" />
                  Generando lectura cada 60s
                  {lastSensor && <> — ultimo: {lastSensor}</>}
                </>
              ) : (
                'Pausado — activa para simular datos en tiempo real'
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {count > 0 && (
            <span className="text-xs text-[#94a3b8]">
              {count} lectura{count !== 1 ? 's' : ''} generada{count !== 1 ? 's' : ''}
            </span>
          )}
          <button
            onClick={() => setIsRunning((r) => !r)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              isRunning
                ? 'bg-[#ef4444]/20 text-[#ef4444] hover:bg-[#ef4444]/30'
                : 'bg-[#32D04F]/20 text-[#32D04F] hover:bg-[#32D04F]/30'
            }`}
          >
            {isRunning ? (
              <>
                <FiPause /> Detener
              </>
            ) : (
              <>
                <FiPlay /> Iniciar
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
