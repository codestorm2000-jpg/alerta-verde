'use client';

import { useState } from 'react';
import { FiZap, FiBell, FiCpu } from 'react-icons/fi';
import LandingHeader from '@/components/LandingHeader';
import LoginModal from '@/components/LoginModal';
import RegisterModal from '@/components/RegisterModal';

const features = [
  {
    icon: <FiZap className="text-[#f59e0b]" />,
    title: 'Deteccion en tiempo real',
    description:
      'Monitoreo continuo de tus paneles solares con sensores IoT que reportan cada minuto. Detecta anomalias al instante.',
  },
  {
    icon: <FiBell className="text-[#32D04F]" />,
    title: 'Alertas inteligentes',
    description:
      'Recibe notificaciones en Telegram y en el dashboard cuando se detectan condiciones criticas en tus paneles.',
  },
  {
    icon: <FiCpu className="text-[#3b82f6]" />,
    title: 'Analisis predictivo',
    description:
      'Modelo de Machine Learning que usa la humedad como predictor principal (+0.28 correlacion) para anticipar fallos.',
  },
];

export default function LandingPage() {
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0f172a]">
      <LandingHeader
        onLoginClick={() => setLoginOpen(true)}
        onRegisterClick={() => setRegisterOpen(true)}
      />

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-20 pb-16 text-center">
        <div className="inline-block bg-[#32D04F]/10 text-[#32D04F] text-sm font-medium px-4 py-1.5 rounded-full mb-6">
          Monitoreo solar con IA para Palmira, Valle del Cauca
        </div>
        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#f8fafc] leading-tight mb-6">
          Protege tus paneles solares
          <br />
          <span className="text-[#32D04F]">con inteligencia artificial</span>
        </h2>
        <p className="text-lg text-[#94a3b8] max-w-2xl mx-auto mb-10">
          Alerta Verde detecta anomalias en tiempo real usando sensores IoT y un modelo
          Random Forest. Recibe alertas antes de que un fallo afecte tu produccion de energia.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => setLoginOpen(true)}
            className="bg-[#32D04F] hover:bg-[#05813e] text-white font-bold px-8 py-4 rounded-xl text-lg transition-colors shadow-lg shadow-[#32D04F]/15"
          >
            Iniciar sesion
          </button>
          <button
            onClick={() => setRegisterOpen(true)}
            className="border border-[#334155] hover:border-[#32D04F] text-[#f8fafc] font-bold px-8 py-4 rounded-xl text-lg transition-colors"
          >
            Crear cuenta gratis
          </button>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <h3 className="text-2xl font-bold text-[#f8fafc] text-center mb-10">
          Todo lo que necesitas para proteger tu inversion solar
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-[#1e293b] border border-[#334155] rounded-xl p-6 hover:border-[#32D04F]/50 transition-colors"
            >
              <span className="text-4xl block mb-4 text-[#32D04F]">{f.icon}</span>
              <h4 className="text-lg font-semibold text-[#f8fafc] mb-2">{f.title}</h4>
              <p className="text-sm text-[#94a3b8] leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="bg-[#1e293b] border border-[#334155] rounded-xl p-8 grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          <div>
            <p className="text-3xl font-bold text-[#32D04F]">3</p>
            <p className="text-sm text-[#94a3b8] mt-1">Sensores activos</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-[#32D04F]">24/7</p>
            <p className="text-sm text-[#94a3b8] mt-1">Monitoreo continuo</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-[#32D04F]">&lt; 2 min</p>
            <p className="text-sm text-[#94a3b8] mt-1">Tiempo de alerta</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#334155] py-8 text-center text-sm text-[#94a3b8]">
        Alerta Verde — Hackathon 2026 — Palmira, Valle del Cauca
      </footer>

      <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} />
      <RegisterModal isOpen={registerOpen} onClose={() => setRegisterOpen(false)} />
    </div>
  );
}
