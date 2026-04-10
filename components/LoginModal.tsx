'use client';

import { useRouter } from 'next/navigation';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: Props) {
  const router = useRouter();

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/dashboard');
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-[#1e293b] border border-[#334155] rounded-xl p-8 max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-[#f8fafc] mb-6 text-center">Iniciar sesion</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-[#94a3b8] mb-1.5">Correo electronico</label>
            <input
              type="email"
              placeholder="admin@alertaverde.co"
              className="w-full bg-[#0f172a] border border-[#334155] text-[#f8fafc] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#32D04F] transition-colors placeholder:text-[#94a3b8]/50"
            />
          </div>
          <div>
            <label className="block text-sm text-[#94a3b8] mb-1.5">Contrasena</label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full bg-[#0f172a] border border-[#334155] text-[#f8fafc] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#32D04F] transition-colors placeholder:text-[#94a3b8]/50"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-[#32D04F] hover:bg-[#05813e] text-white font-bold py-3 rounded-lg transition-colors mt-2"
          >
            Entrar
          </button>
        </form>
        <button onClick={onClose} className="mt-4 text-sm text-[#94a3b8] hover:text-[#f8fafc] w-full text-center transition-colors">
          Cancelar
        </button>
      </div>
    </div>
  );
}
