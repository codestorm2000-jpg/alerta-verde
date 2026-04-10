'use client';

import { createContext, useCallback, useContext, useState } from 'react';
import { FiBell, FiCheck, FiAlertTriangle, FiX } from 'react-icons/fi';

type ToastType = 'success' | 'warning' | 'anomaly';

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  addToast: (message: string, type: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue>({ addToast: () => {} });

export const useToast = () => useContext(ToastContext);

let toastId = 0;

export default function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType) => {
    const id = ++toastId;
    setToasts((prev) => [...prev.slice(-2), { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const iconMap = {
    success: <FiCheck className="text-[#32D04F] shrink-0" />,
    warning: <FiAlertTriangle className="text-[#f59e0b] shrink-0" />,
    anomaly: <FiBell className="text-[#ef4444] shrink-0" />,
  };

  const borderMap = {
    success: 'border-l-[#32D04F]',
    warning: 'border-l-[#f59e0b]',
    anomaly: 'border-l-[#ef4444]',
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[60] flex flex-col gap-2 max-w-sm">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`bg-[#1e293b] border border-[#334155] border-l-4 ${borderMap[toast.type]} rounded-lg p-4 shadow-lg shadow-black/30 flex items-start gap-3 animate-slide-in`}
          >
            <span className="text-lg mt-0.5">{iconMap[toast.type]}</span>
            <p className="text-sm text-[#f8fafc] flex-1">{toast.message}</p>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-[#94a3b8] hover:text-[#f8fafc] shrink-0"
            >
              <FiX size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
