'use client';

import Image from 'next/image';

interface Props {
  onLoginClick: () => void;
  onRegisterClick: () => void;
}

export default function LandingHeader({ onLoginClick, onRegisterClick }: Props) {
  return (
    <header className="sticky top-0 z-30 bg-[#0f172a]/95 backdrop-blur border-b border-[#334155]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-[#f8fafc] flex items-center gap-2">
          <Image src="/logo.png" alt="Senza Green" width={32} height={32} /> Senza Green
        </h1>
        <div className="flex items-center gap-3">
          <button
            onClick={onLoginClick}
            className="border border-[#32D04F] text-[#32D04F] hover:bg-[#32D04F]/10 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Iniciar sesion
          </button>
          <button
            onClick={onRegisterClick}
            className="bg-[#32D04F] hover:bg-[#05813e] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Registrarse
          </button>
        </div>
      </div>
    </header>
  );
}
