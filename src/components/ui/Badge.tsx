import type { ReactNode } from "react";
import type { ModerationStatus } from "../../types/api-types";
import { STATUS_LABELS } from "../../lib/labels";

type Tone = "neutral" | "brand" | "green" | "amber" | "red" | "blue";

const TONES: Record<Tone, string> = {
    neutral: "bg-stone-100 text-stone-700",
    brand: "bg-brand-50 text-brand-700",
    green: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    red: "bg-red-50 text-red-700",
    blue: "bg-sky-50 text-sky-700",
};

export function Badge({ tone = "neutral", children }: { tone?: Tone; children: ReactNode }) {
    return (
        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${TONES[tone]}`}>
            {children}
        </span>
    );
}

const STATUS_TONES: Record<ModerationStatus, Tone> = {
    APPROVED: "green",
    PENDING: "amber",
    REJECTED: "red",
};

export function StatusBadge({ status }: { status: ModerationStatus }) {
    return <Badge tone={STATUS_TONES[status]}>{STATUS_LABELS[status]}</Badge>;
}
