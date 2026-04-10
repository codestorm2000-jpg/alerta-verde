'use client';

import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import ToastProvider from '@/components/ToastProvider';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ToastProvider>
      <div className="min-h-screen bg-[#0f172a] flex">
        <Sidebar />
        <div className="flex-1 min-h-screen overflow-auto">
          <Header />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
            {children}
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}
