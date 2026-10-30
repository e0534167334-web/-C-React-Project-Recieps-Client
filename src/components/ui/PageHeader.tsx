import type { ReactNode } from "react";

interface PageHeaderProps {
    title: string;
    description?: ReactNode;
    action?: ReactNode;
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
    return (
        <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-stone-900">{title}</h1>
                {description && <p className="mt-1.5 text-stone-500">{description}</p>}
            </div>
            {action}
        </div>
    );
}

interface TabsProps<T extends string> {
    value: T;
    options: { value: T; label: string; count?: number }[];
    onChange: (value: T) => void;
}

/** לשוניות סינון בסגנון "גלולות" */
export function Tabs<T extends string>({ value, options, onChange }: TabsProps<T>) {
    return (
        <div className="flex flex-wrap gap-1 rounded-xl border border-stone-200 bg-white p-1 shadow-sm" role="tablist">
            {options.map((o) => (
                <button
                    key={o.value}
                    type="button"
                    role="tab"
                    aria-selected={value === o.value}
                    onClick={() => onChange(o.value)}
                    className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                        value === o.value ? "bg-stone-900 text-white" : "text-stone-600 hover:bg-stone-100"
                    }`}
                >
                    {o.label}
                </button>
            ))}
        </div>
    );
}
