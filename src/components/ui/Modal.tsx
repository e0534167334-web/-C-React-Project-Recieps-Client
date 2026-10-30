import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";
import { Button } from "./Button";

interface ModalProps {
    open: boolean;
    title: string;
    onClose: () => void;
    children: ReactNode;
    footer?: ReactNode;
}

export function Modal({ open, title, onClose, children, footer }: ModalProps) {
    // סגירה ב־Escape ומניעת גלילה של הדף מאחור
    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
        document.addEventListener("keydown", onKey);
        document.body.style.overflow = "hidden";
        return () => {
            document.removeEventListener("keydown", onKey);
            document.body.style.overflow = "";
        };
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
            <div className="absolute inset-0 animate-fade-in bg-stone-900/40 backdrop-blur-sm" onClick={onClose} />
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-title"
                className="relative w-full max-w-md animate-slide-up rounded-2xl bg-white p-6 shadow-card-hover"
            >
                <div className="mb-4 flex items-start justify-between gap-4">
                    <h2 id="modal-title" className="text-lg font-semibold text-stone-900">
                        {title}
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-600"
                        aria-label="סגירה"
                    >
                        <X className="size-5" />
                    </button>
                </div>
                <div className="text-sm text-stone-600">{children}</div>
                {footer && <div className="mt-6 flex justify-end gap-2">{footer}</div>}
            </div>
        </div>
    );
}

interface ConfirmDialogProps {
    open: boolean;
    title: string;
    message: ReactNode;
    confirmText?: string;
    loading?: boolean;
    onConfirm: () => void;
    onClose: () => void;
}

export function ConfirmDialog({
    open,
    title,
    message,
    confirmText = "מחיקה",
    loading,
    onConfirm,
    onClose,
}: ConfirmDialogProps) {
    return (
        <Modal
            open={open}
            title={title}
            onClose={onClose}
            footer={
                <>
                    <Button variant="secondary" onClick={onClose} disabled={loading}>
                        ביטול
                    </Button>
                    <Button variant="danger" onClick={onConfirm} loading={loading}>
                        {confirmText}
                    </Button>
                </>
            }
        >
            {message}
        </Modal>
    );
}
