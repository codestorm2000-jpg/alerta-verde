import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
});

export const metadata: Metadata = {
  title: 'Senza Green — Monitoreo Solar',
  description: 'Sistema de monitoreo de anomalias en paneles solares - Palmira, Valle del Cauca',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${geistSans.variable} font-sans antialiased bg-[#0f172a] min-h-screen`}>
        {children}
      </body>
    </html>
  );
}
