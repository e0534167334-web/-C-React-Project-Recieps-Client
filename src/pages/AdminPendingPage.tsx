import { useState, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Check, ExternalLink, ImageIcon, PlayCircle, X } from "lucide-react";
import { getPendingQueue, moderate, type ModerationType } from "../api/admin";
import { getErrorMessage } from "../api/api";
import { useToast } from "../context/useToast";
import { REJECTION_REASONS, formatRelativeDate } from "../lib/labels";
import { cardClass } from "../lib/ui";
import type { AuthorSummary } from "../types/api-types";
import { Button } from "../components/ui/Button";
import { Field, Select, Textarea } from "../components/ui/Field";
import { Modal } from "../components/ui/Modal";
import { PageHeader, Tabs } from "../components/ui/PageHeader";
import { EmptyState, ErrorState, PageLoader } from "../components/ui/States";

interface PendingCard {
    type: ModerationType;
    id: number;
    kind: string;
    title: string;
    text: string | null;
    link: string;
    imageUrl: string | null;
    videoUrl: string | null;
    author: AuthorSummary;
    createdAt: string;
}

type TabValue = "" | ModerationType;

export function AdminPendingPage() {
    const toast = useToast();
    const queryClient = useQueryClient();
    const [tab, setTab] = useState<TabValue>("");
    const [rejecting, setRejecting] = useState<PendingCard | null>(null);
    const [reason, setReason] = useState("");
    const [customReason, setCustomReason] = useState("");

    const queue = useQuery({ queryKey: ["admin", "pending"], queryFn: getPendingQueue });

    const decide = useMutation({
        mutationFn: (v: { card: PendingCard; decision: "APPROVED" | "REJECTED"; reason?: string }) =>
            moderate(v.card.type, v.card.id, v.decision, v.reason),
        onSuccess: (_, v) => {
            queryClient.invalidateQueries({ queryKey: ["admin"] });
            queryClient.invalidateQueries({ queryKey: ["recipes"] });
            queryClient.invalidateQueries({ queryKey: ["recipe"] });
            queryClient.invalidateQueries({ queryKey: ["forum"] });
            toast(v.decision === "APPROVED" ? `"${v.card.title}" אושר ופורסם` : `"${v.card.title}" נדחה`);
            setRejecting(null);
        },
        onError: (error) => {
            toast(getErrorMessage(error), "error");
            queryClient.invalidateQueries({ queryKey: ["admin"] });
            setRejecting(null);
        },
    });

    const openReject = (card: PendingCard) => {
        setReason(REJECTION_REASONS[0]);
        setCustomReason("");
        setRejecting(card);
    };

    const confirmReject = () => {
        if (!rejecting) return;
        const finalReason = reason === "other" ? customReason.trim() : reason;
        decide.mutate({ card: rejecting, decision: "REJECTED", reason: finalReason || undefined });
    };

    if (queue.isPending) return <PageLoader text="טוען את תור האישורים..." />;
    if (queue.isError) return <ErrorState message={getErrorMessage(queue.error)} onRetry={() => queue.refetch()} />;

    const { recipes, questions, answers } = queue.data;
    const cards: PendingCard[] = [
        ...recipes.map((r) => ({
            type: "recipes" as const, id: r.id, kind: "מתכון", title: r.title, text: r.description,
            link: `/recipes/${r.id}`, imageUrl: r.imageUrl, videoUrl: r.videoUrl, author: r.author, createdAt: r.updatedAt,
        })),
        ...questions.map((q) => ({
            type: "questions" as const, id: q.id, kind: "שאלה", title: q.title, text: q.body,
            link: `/forum?open=${q.id}`, imageUrl: q.imageUrl, videoUrl: q.videoUrl, author: q.author, createdAt: q.updatedAt,
        })),
        ...answers.map((a) => ({
            type: "answers" as const, id: a.id, kind: "תשובה", title: `תשובה לשאלה: ${a.question.title}`, text: a.body,
            link: `/forum?open=${a.question.id}`, imageUrl: a.imageUrl, videoUrl: a.videoUrl, author: a.author, createdAt: a.updatedAt,
        })),
    ];
    const visible = tab ? cards.filter((c) => c.type === tab) : cards;

    const tabs: { value: TabValue; label: string }[] = [
        { value: "", label: `הכול (${cards.length})` },
        { value: "recipes", label: `מתכונים (${recipes.length})` },
        { value: "questions", label: `שאלות (${questions.length})` },
        { value: "answers", label: `תשובות (${answers.length})` },
    ];

    return (
        <div className="space-y-6">
            <PageHeader
                title="תור אישורים"
                description="תוכן ציבורי עם תמונה או סרטון מחכה לאישור לפני שהוא מתפרסם"
            />
            <Tabs value={tab} options={tabs} onChange={setTab} />

            {visible.length === 0 ? (
                <EmptyState emoji="✨" title="התור ריק" description="אין כרגע תוכן שממתין לאישור. כל הכבוד!" />
            ) : (
                <ul className="grid gap-4 lg:grid-cols-2">
                    {visible.map((card) => (
                        <li key={`${card.type}-${card.id}`} className={`${cardClass} flex flex-col p-5`}>
                            <div className="mb-3 flex items-center justify-between gap-2 text-xs">
                                <span className="rounded-full bg-amber-50 px-2.5 py-0.5 font-medium text-amber-700">{card.kind}</span>
                                <span className="text-stone-400">
                                    {card.author.displayName} · {formatRelativeDate(card.createdAt)}
                                </span>
                            </div>
                            <h3 className="font-semibold text-stone-900">{card.title}</h3>
                            {card.text && <p className="mt-1 line-clamp-3 text-sm text-stone-600">{card.text}</p>}

                            <div className="mt-4 flex flex-wrap gap-2">
                                {card.imageUrl && (
                                    <MediaLink href={card.imageUrl} icon={<ImageIcon className="size-4" />}>
                                        תמונה
                                    </MediaLink>
                                )}
                                {card.videoUrl && (
                                    <MediaLink href={card.videoUrl} icon={<PlayCircle className="size-4" />}>
                                        <span dir="ltr" className="max-w-48 truncate">{card.videoUrl}</span>
                                    </MediaLink>
                                )}
                                <Link to={card.link} className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium text-stone-500 hover:bg-stone-100 hover:text-stone-800">
                                    <ExternalLink className="size-3.5" /> לתוכן המלא
                                </Link>
                            </div>

                            {card.imageUrl && <img src={card.imageUrl} alt="" className="mt-4 h-40 w-full rounded-xl object-cover" />}

                            <div className="mt-auto flex gap-2 pt-5">
                                <Button
                                    variant="success"
                                    className="flex-1"
                                    loading={decide.isPending && decide.variables?.card === card && decide.variables.decision === "APPROVED"}
                                    disabled={decide.isPending}
                                    onClick={() => decide.mutate({ card, decision: "APPROVED" })}
                                >
                                    <Check className="size-4" /> אישור
                                </Button>
                                <Button variant="secondary" className="flex-1 text-red-600" disabled={decide.isPending} onClick={() => openReject(card)}>
                                    <X className="size-4" /> דחייה
                                </Button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            <Modal
                open={rejecting !== null}
                title="דחיית תוכן"
                onClose={() => setRejecting(null)}
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setRejecting(null)} disabled={decide.isPending}>
                            ביטול
                        </Button>
                        <Button variant="danger" onClick={confirmReject} loading={decide.isPending} disabled={reason === "other" && !customReason.trim()}>
                            דחייה
                        </Button>
                    </>
                }
            >
                <p className="mb-4">
                    <span className="font-medium text-stone-800">{rejecting?.title}</span> יוחזר לכותב/ת עם סיבת הדחייה.
                </p>
                <div className="space-y-4">
                    <Field label="סיבת הדחייה" htmlFor="reason">
                        <Select id="reason" value={reason} onChange={(e) => setReason(e.target.value)}>
                            {REJECTION_REASONS.map((r) => (
                                <option key={r} value={r}>
                                    {r}
                                </option>
                            ))}
                            <option value="other">סיבה אחרת...</option>
                        </Select>
                    </Field>
                    {reason === "other" && (
                        <Field label="פירוט" htmlFor="customReason" hint="עד 300 תווים">
                            <Textarea id="customReason" rows={3} maxLength={300} value={customReason} onChange={(e) => setCustomReason(e.target.value)} />
                        </Field>
                    )}
                </div>
            </Modal>
        </div>
    );
}

function MediaLink({ href, icon, children }: { href: string; icon: ReactNode; children: ReactNode }) {
    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg bg-stone-100 px-2.5 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-200"
        >
            {icon}
            {children}
        </a>
    );
}
