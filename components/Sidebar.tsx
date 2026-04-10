'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import { FiGrid, FiFileText, FiBell, FiUsers, FiLogOut, FiMenu } from 'react-icons/fi';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: <FiGrid /> },
  { href: '/dashboard/reportes', label: 'Reportes', icon: <FiFileText /> },
  { href: '/dashboard/alertas', label: 'Alertas', icon: <FiBell /> },
  { href: '/dashboard/tecnicos', label: 'Tecnicos', icon: <FiUsers /> },
];

export default function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href);

  const nav = (
    <nav className="flex flex-col h-full">
      <div className="p-5 border-b border-[#334155]">
        <h2 className="text-lg font-bold text-[#f8fafc] flex items-center gap-2">
          <Image src="/logo.png" alt="Senza Green" width={28} height={28} /> Senza Green
        </h2>
        <p className="text-xs text-[#94a3b8] mt-1">Panel de monitoreo</p>
      </div>

      <div className="flex-1 py-4 space-y-1 px-3">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
              isActive(item.href)
                ? 'bg-[#334155] text-[#f8fafc] border-l-2 border-l-[#32D04F]'
                : 'text-[#94a3b8] hover:bg-[#334155]/50 hover:text-[#f8fafc]'
            }`}
          >
            <span className="text-lg shrink-0">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </div>

      <div className="p-3 border-t border-[#334155]">
        <button
          onClick={() => {
            setMobileOpen(false);
            router.push('/');
          }}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[#94a3b8] hover:bg-[#334155]/50 hover:text-[#f8fafc] transition-colors w-full"
        >
          <FiLogOut className="text-lg shrink-0" />
          <span>Cerrar sesion</span>
        </button>
      </div>
    </nav>
  );

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 bg-[#1e293b] border border-[#334155] rounded-lg p-2 text-[#f8fafc]"
      >
        <FiMenu className="w-6 h-6" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={`lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-[#1e293b] border-r border-[#334155] transform transition-transform duration-200 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {nav}
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-64 bg-[#1e293b] border-r border-[#334155] min-h-screen shrink-0">
        {nav}
      </aside>
    </>
  );
}
