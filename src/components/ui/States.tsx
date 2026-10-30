import type { ReactNode } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "./Button";

export function Spinner({ className = "size-6" }: { className?: string }) {
    return <Loader2 className={`animate-spin text-brand-500 ${className}`} aria-label="טוען" />;
}

export function PageLoader({ text = "טוען..." }: { text?: string }) {
    return (
        <div className="flex flex-col items-center justify-center gap-3 py-24 text-stone-500">
            <Spinner className="size-8" />
            <p className="text-sm">{text}</p>
        </div>
    );
}

interface ErrorStateProps {
    message: string;
    onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
    return (
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-red-100 bg-red-50/50 px-6 py-14 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-red-100 text-red-600">
                <AlertTriangle className="size-6" />
            </div>
            <p className="text-stone-700">{message}</p>
            {onRetry && (
                <Button variant="secondary" onClick={onRetry}>
                    נסו שוב
                </Button>
            )}
        </div>
    );
}

interface EmptyStateProps {
    emoji?: string;
    title: string;
    description?: ReactNode;
    action?: ReactNode;
}

export function EmptyState({ emoji = "🍽️", title, description, action }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-stone-300 bg-white/60 px-6 py-16 text-center">
            <span className="text-5xl" aria-hidden>
                {emoji}
            </span>
            <h3 className="text-lg font-semibold text-stone-800">{title}</h3>
            {description && <p className="max-w-sm text-sm text-stone-500">{description}</p>}
            {action && <div className="mt-2">{action}</div>}
        </div>
    );
}
