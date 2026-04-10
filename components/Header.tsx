'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { fetchLastLectura } from '@/lib/queries';

function timeAgoShort(dateStr: string | null): string {
  if (!dateStr) return 'sin datos';
  const diff = Date.now() - new Date(dateStr).getTime();
  const secs = Math.floor(diff / 1000);
  if (secs < 60) return `hace ${secs}s`;
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `hace ${mins}m`;
  const hours = Math.floor(mins / 60);
  return `hace ${hours}h`;
}

export default function Header() {
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);
  const [displayTime, setDisplayTime] = useState('...');

  useEffect(() => {
    const load = () => fetchLastLectura().then(setLastUpdate);
    load();
    const interval = setInterval(load, 10_000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const tick = () => setDisplayTime(timeAgoShort(lastUpdate));
    tick();
    const interval = setInterval(tick, 5_000);
    return () => clearInterval(interval);
  }, [lastUpdate]);

  const isRecent =
    lastUpdate != null &&
    Date.now() - new Date(lastUpdate).getTime() < 10 * 60 * 1000;

  return (
    <header className="bg-[#0f172a] border-b border-[#334155] px-6 py-4">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-xl font-bold text-[#f8fafc] flex items-center gap-2">
          <Image src="/logo.png" alt="Senza Green" width={32} height={32} /> Senza Green
        </h1>
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                isRecent ? 'bg-[#32D04F] animate-pulse' : 'bg-[#ef4444]'
              }`}
            />
            <span className="text-[#94a3b8]">
              {isRecent ? 'SISTEMA ACTIVO' : 'SIN DATOS RECIENTES'}
            </span>
          </div>
          <span className="text-[#94a3b8]">
            Última actualización: {displayTime}
          </span>
        </div>
      </div>
    </header>
  );
}
