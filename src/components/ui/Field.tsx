import type { ComponentProps, ReactNode } from "react";
import { inputClass } from "../../lib/ui";

interface FieldProps {
    label: string;
    htmlFor: string;
    error?: string;
    hint?: ReactNode;
    required?: boolean;
    children: ReactNode;
}

/** תווית, שדה, הודעת עזרה והודעת שגיאה */
export function Field({ label, htmlFor, error, hint, required, children }: FieldProps) {
    return (
        <div className="space-y-1.5">
            <label htmlFor={htmlFor} className="block text-sm font-medium text-stone-700">
                {label}
                {required && <span className="ms-0.5 text-brand-500">*</span>}
            </label>
            {children}
            {error ? (
                <p className="text-xs text-red-600" role="alert">
                    {error}
                </p>
            ) : (
                hint && <p className="text-xs text-stone-500">{hint}</p>
            )}
        </div>
    );
}

/** רוחב מלא, אלא אם הועבר רוחב אחר (למשל w-auto) */
const width = (className: string) => (/(^|\s)w-/.test(className) ? "" : "w-full");

export function Input({ className = "", ...props }: ComponentProps<"input">) {
    return <input className={`${inputClass} ${width(className)} ${className}`} {...props} />;
}

export function Textarea({ className = "", ...props }: ComponentProps<"textarea">) {
    return <textarea className={`${inputClass} ${width(className)} min-h-28 resize-y leading-relaxed ${className}`} {...props} />;
}

export function Select({ className = "", ...props }: ComponentProps<"select">) {
    return <select className={`${inputClass} ${width(className)} cursor-pointer pe-8 ${className}`} {...props} />;
}

interface CheckboxProps extends ComponentProps<"input"> {
    label: ReactNode;
    description?: ReactNode;
}

export function Checkbox({ label, description, id, ...props }: CheckboxProps) {
    return (
        <label htmlFor={id} className="flex cursor-pointer items-start gap-3">
            <input
                id={id}
                type="checkbox"
                className="mt-0.5 size-4 cursor-pointer rounded border-stone-300 accent-brand-500"
                {...props}
            />
            <span>
                <span className="block text-sm font-medium text-stone-700">{label}</span>
                {description && <span className="block text-xs text-stone-500">{description}</span>}
            </span>
        </label>
    );
}
