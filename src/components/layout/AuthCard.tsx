import type { ReactNode } from "react";

interface AuthCardProps {
    emoji: string;
    title: string;
    subtitle: string;
    children: ReactNode;
    footer: ReactNode;
}

/** מסגרת משותפת לעמודי התחברות והרשמה */
export function AuthCard({ emoji, title, subtitle, children, footer }: AuthCardProps) {
    return (
        <div className="mx-auto max-w-md animate-slide-up py-4 sm:py-8">
            <div className="rounded-3xl border border-stone-200/70 bg-white p-7 shadow-card sm:p-9">
                <div className="mb-7 text-center">
                    <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-brand-50 text-3xl">
                        {emoji}
                    </div>
                    <h1 className="text-2xl font-bold text-stone-900">{title}</h1>
                    <p className="mt-1.5 text-sm text-stone-500">{subtitle}</p>
                </div>
                {children}
            </div>
            <p className="mt-6 text-center text-sm text-stone-500">{footer}</p>
        </div>
    );
}
