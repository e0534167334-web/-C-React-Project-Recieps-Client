import { useCallback, useMemo, useState, type ReactNode } from "react";
import { CheckCircle2, Info, X, XCircle } from "lucide-react";
import { ToastContext, type ToastKind } from "./toast-context";

interface Toast {
    id: number;
    message: string;
    kind: ToastKind;
}

const STYLES: Record<ToastKind, string> = {
    success: "border-emerald-200 bg-emerald-50 text-emerald-900",
    error: "border-red-200 bg-red-50 text-red-900",
    info: "border-stone-200 bg-white text-stone-800",
};

const ICONS = { success: CheckCircle2, error: XCircle, info: Info };

let nextId = 1;

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const dismiss = useCallback((id: number) => {
        setToasts((current) => current.filter((t) => t.id !== id));
    }, []);

    const showToast = useCallback(
        (message: string, kind: ToastKind = "success") => {
            const id = nextId++;
            setToasts((current) => [...current, { id, message, kind }]);
            setTimeout(() => dismiss(id), 4000);
        },
        [dismiss]
    );

    const value = useMemo(() => ({ showToast }), [showToast]);

    return (
        <ToastContext.Provider value={value}>
            {children}
            <div
                aria-live="polite"
                className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex flex-col items-center gap-2 px-4"
            >
                {toasts.map((toast) => {
                    const Icon = ICONS[toast.kind];
                    return (
                        <div
                            key={toast.id}
                            role="status"
                            className={`pointer-events-auto flex w-full max-w-sm animate-slide-up items-center gap-3 rounded-xl border px-4 py-3 text-sm shadow-card ${STYLES[toast.kind]}`}
                        >
                            <Icon className="size-5 shrink-0" />
                            <p className="flex-1">{toast.message}</p>
                            <button
                                type="button"
                                onClick={() => dismiss(toast.id)}
                                className="rounded-md p-1 opacity-60 hover:opacity-100"
                                aria-label="סגירה"
                            >
                                <X className="size-4" />
                            </button>
                        </div>
                    );
                })}
            </div>
        </ToastContext.Provider>
    );
}
