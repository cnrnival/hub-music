/**
 * Hub Music - Toast
 * Sistema de notificações toast
 * Toast notification system
 *
 * @languages pt-BR / en-US
 */

import { useState, useCallback, useEffect, createContext, useContext, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { cn } from '../../../lib/utils';

type ToastType = 'success' | 'error' | 'warning' | 'info' | 'default';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  duration?: number;
  persistent?: boolean;
}

interface ToastContextValue {
  toasts: Toast[];
  toast: (options: Omit<Toast, 'id'>) => string;
  dismiss: (id: string) => void;
  dismissAll: () => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const DEFAULT_DURATIONS: Record<ToastType, number> = {
  success: 4000,
  error: 6000,
  warning: 5000,
  info: 4000,
  default: 4000,
};

const ICONS: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle className="w-5 h-5 text-green-500" />,
  error: <AlertCircle className="w-5 h-5 text-red-500" />,
  warning: <AlertTriangle className="w-5 h-5 text-yellow-500" />,
  info: <Info className="w-5 h-5 text-blue-500" />,
  default: <Info className="w-5 h-5 text-gray-500" />,
};

const TOAST_COLORS: Record<ToastType, string> = {
  success: 'border-green-500/30 bg-green-500/10',
  error: 'border-red-500/30 bg-red-500/10',
  warning: 'border-yellow-500/30 bg-yellow-500/10',
  info: 'border-blue-500/30 bg-blue-500/10',
  default: 'border-gray-500/30 bg-gray-500/10',
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((options: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: Toast = {
      id,
      duration: DEFAULT_DURATIONS[options.type || 'default'],
      ...options,
    };

    setToasts((prev) => [...prev, newToast]);

    // Auto dismiss
    if (!newToast.persistent && newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        dismiss(id);
      }, newToast.duration);
    }

    return id;
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const dismissAll = useCallback(() => {
    setToasts([]);
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss, dismissAll }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

function ToastContainer({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: string) => void }) {
  if (toasts.length === 0) return null;

  return createPortal(
    <div
      className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 w-80 max-w-[calc(100vw-2rem)]"
      role="region"
      aria-label="Notifications"
      aria-live="polite"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>,
    document.body
  );
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const [isExiting, setIsExiting] = useState(false);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => onDismiss(toast.id), 200);
  };

  useEffect(() => {
    // Pause auto-dismiss on hover
    const timer = setTimeout(() => {}, toast.duration || 0);
    return () => clearTimeout(timer);
  }, [toast.duration]);

  return (
    <div
      className={cn(
        'relative flex items-start gap-3 p-4 rounded-xl border shadow-lg',
        'animate-slide-in-right',
        isExiting && 'animate-fade-out',
        TOAST_COLORS[toast.type]
      )}
      role="alert"
      aria-live="assertive"
    >
      <div className="flex-shrink-0 mt-0.5">{ICONS[toast.type]}</div>

      <div className="flex-1 min-w-0">
        <p className="font-medium text-text-primary">{toast.title}</p>
        {toast.description && (
          <p className="mt-1 text-sm text-text-secondary">{toast.description}</p>
        )}
        {toast.action && (
          <button
            onClick={() => {
              toast.action!.onClick();
              handleDismiss();
            }}
            className="mt-2 text-sm font-medium text-primary hover:underline"
          >
            {toast.action.label}
          </button>
        )}
      </div>

      <button
        onClick={handleDismiss}
        className="flex-shrink-0 text-text-muted hover:text-text-primary transition-colors"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Progress bar */}
      {!toast.persistent && toast.duration && toast.duration > 0 && (
        <div
          className="absolute bottom-0 left-0 h-0.5 rounded-b-xl bg-current/30 animate-toast-progress"
          style={{
            animationDuration: `${toast.duration}ms`,
            transformOrigin: 'left',
          }}
        />
      )}
    </div>
  );
}

// Hook para usar toasts
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

// Helper functions
export const toast = {
  success: (title: string, description?: string, options?: Partial<Toast>) =>
    useToast().toast({ type: 'success', title, description, ...options }),
  error: (title: string, description?: string, options?: Partial<Toast>) =>
    useToast().toast({ type: 'error', title, description, ...options }),
  warning: (title: string, description?: string, options?: Partial<Toast>) =>
    useToast().toast({ type: 'warning', title, description, ...options }),
  info: (title: string, description?: string, options?: Partial<Toast>) =>
    useToast().toast({ type: 'info', title, description, ...options }),
  default: (title: string, description?: string, options?: Partial<Toast>) =>
    useToast().toast({ type: 'default', title, description, ...options }),
  dismiss: (id: string) => useToast().dismiss(id),
  dismissAll: () => useToast().dismissAll(),
};

// CSS animations needed in globals.css:
// @keyframes slide-in-right { from { opacity: 0; transform: translateX(100%); } to { opacity: 1; transform: translateX(0); } }
// @keyframes fade-out { from { opacity: 1; } to { opacity: 0; } }
// @keyframes toast-progress { from { transform: scaleX(1); } to { transform: scaleX(0); } }
// .animate-slide-in-right { animation: slide-in-right 0.3s ease-out; }
// .animate-fade-out { animation: fade-out 0.2s ease-in forwards; }
// .animate-toast-progress { animation: toast-progress linear forwards; }