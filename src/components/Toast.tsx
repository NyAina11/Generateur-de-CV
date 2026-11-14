import { CircleAlert, CircleCheck, Info, X } from 'lucide-react';
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';

type ToastKind = 'success' | 'error' | 'info';

export interface ToastOptions {
  kind?: ToastKind;
  /** Bouton d'action, par exemple « Annuler ». */
  action?: { label: string; onClick: () => void };
  /** Durée d'affichage en millisecondes. */
  duration?: number;
}

interface ToastItem {
  id: number;
  message: string;
  kind: ToastKind;
  action?: ToastOptions['action'];
}

type Notify = (message: string, options?: ToastOptions) => void;

const ToastContext = createContext<Notify>(() => {});

/** Affiche une notification discrète (remplace les `alert()` bloquants). */
export const useToast = (): Notify => useContext(ToastContext);

const ICONS = { success: CircleCheck, error: CircleAlert, info: Info };
const ICON_COLORS = { success: 'text-emerald-400', error: 'text-rose-400', info: 'text-sky-400' };

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timers = useRef(new Map<number, number>());
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => {
    window.clearTimeout(timers.current.get(id));
    timers.current.delete(id);
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const notify = useCallback<Notify>(
    (message, options = {}) => {
      const id = nextId.current++;
      const kind = options.kind ?? 'info';
      const duration = options.duration ?? (options.action ? 8000 : kind === 'error' ? 7000 : 4000);
      // Trois notifications au maximum : les plus anciennes laissent la place.
      setToasts((current) => [...current.slice(-2), { id, message, kind, action: options.action }]);
      timers.current.set(
        id,
        window.setTimeout(() => dismiss(id), duration),
      );
    },
    [dismiss],
  );

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach((timer) => window.clearTimeout(timer));
  }, []);

  return (
    <ToastContext.Provider value={notify}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-24 z-[70] flex flex-col items-center gap-2 px-4 lg:inset-x-auto lg:bottom-6 lg:left-6 lg:items-start print:hidden"
        aria-live="polite"
      >
        {toasts.map((toast) => {
          const Icon = ICONS[toast.kind];
          return (
            <div
              key={toast.id}
              role={toast.kind === 'error' ? 'alert' : 'status'}
              className="pointer-events-auto flex w-full max-w-sm animate-rise items-start gap-3 rounded-xl bg-slate-900 py-3 pl-4 pr-2 text-sm text-white shadow-xl"
            >
              <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${ICON_COLORS[toast.kind]}`} aria-hidden="true" />
              <p className="min-w-0 flex-1 leading-snug">{toast.message}</p>
              {toast.action && (
                <button
                  type="button"
                  onClick={() => {
                    toast.action?.onClick();
                    dismiss(toast.id);
                  }}
                  className="shrink-0 rounded-md px-2 py-0.5 font-semibold text-indigo-300 transition-colors hover:bg-white/10 hover:text-indigo-200"
                >
                  {toast.action.label}
                </button>
              )}
              <button
                type="button"
                onClick={() => dismiss(toast.id)}
                aria-label="Fermer la notification"
                className="shrink-0 rounded-md p-1 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
