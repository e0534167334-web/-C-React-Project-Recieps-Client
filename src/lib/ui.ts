export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "success";
export type ButtonSize = "sm" | "md" | "lg";

const BASE =
    "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-150 select-none disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]";

const VARIANTS: Record<ButtonVariant, string> = {
    primary: "bg-brand-500 text-white shadow-sm hover:bg-brand-600",
    secondary: "border border-stone-200 bg-white text-stone-700 shadow-sm hover:border-stone-300 hover:bg-stone-50",
    ghost: "text-stone-600 hover:bg-stone-100 hover:text-stone-900",
    danger: "bg-red-600 text-white shadow-sm hover:bg-red-700",
    success: "bg-emerald-600 text-white shadow-sm hover:bg-emerald-700",
};

const SIZES: Record<ButtonSize, string> = {
    sm: "h-8 px-3 text-sm",
    md: "h-10 px-4 text-sm",
    lg: "h-12 px-6 text-base",
};

/** מחלקות של כפתור, גם לקישורים שנראים כמו כפתור */
export function buttonClass(variant: ButtonVariant = "primary", size: ButtonSize = "md", extra = "") {
    return `${BASE} ${VARIANTS[variant]} ${SIZES[size]} ${extra}`;
}

/** בלי רוחב: כל שדה מקבל w-full, או רוחב אחר שהועבר ב־className */
export const inputClass =
    "rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-sm text-stone-800 shadow-sm transition placeholder:text-stone-400 hover:border-stone-300 focus:border-brand-400 focus:outline-none focus:ring-4 focus:ring-brand-100 aria-[invalid=true]:border-red-300 aria-[invalid=true]:focus:ring-red-100";

export const cardClass = "rounded-2xl border border-stone-200/70 bg-white shadow-card";
