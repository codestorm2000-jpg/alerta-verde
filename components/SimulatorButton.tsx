'use client';

import { useState } from 'react';
import { FiAlertOctagon, FiCheck, FiX } from 'react-icons/fi';
import { insertSimulatedReading } from '@/lib/queries';

type Status = 'idle' | 'loading' | 'success' | 'error';

export default function SimulatorButton() {
  const [status, setStatus] = useState<Status>('idle');

  const handleClick = async () => {
    if (status === 'loading') return;
    setStatus('loading');

    const result = await insertSimulatedReading();

    if (!result.success) {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 4000);
      return;
    }

    await new Promise((r) => setTimeout(r, 1500));
    setStatus('success');
    setTimeout(() => setStatus('idle'), 4000);
  };

  const config = {
    idle: {
      text: 'Simular lectura critica',
      bg: 'bg-[#ef4444] hover:bg-[#dc2626]',
      icon: <FiAlertOctagon />,
    },
    loading: {
      text: 'Enviando lectura...',
      bg: 'bg-[#ef4444]/70 cursor-wait',
      icon: null,
    },
    success: {
      text: 'Alerta enviada — revisa Telegram',
      bg: 'bg-[#32D04F]',
      icon: <FiCheck />,
    },
    error: {
      text: 'Error — reintenta',
      bg: 'bg-[#ef4444]',
      icon: <FiX />,
    },
  };

  const { text, bg, icon } = config[status];

  return (
    <div className="flex justify-center">
      <button
        onClick={handleClick}
        disabled={status === 'loading'}
        className={`${bg} text-white font-bold text-lg px-8 py-4 rounded-xl transition-all shadow-lg shadow-red-500/20 flex items-center gap-3`}
      >
        {status === 'loading' ? (
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : icon ? (
          <span>{icon}</span>
        ) : null}
        {text}
      </button>
    </div>
  );
}
