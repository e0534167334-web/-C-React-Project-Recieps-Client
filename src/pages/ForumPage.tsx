import { useEffect, useRef } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Plus, ShieldCheck } from "lucide-react";
import { getQuestion, getQuestions, type QuestionQuery } from "../api/forum";
import { getErrorMessage } from "../api/api";
import { useAuth } from "../context/useAuth";
import { useCategories } from "../hooks/useCategories";
import { useParamState } from "../hooks/useParamState";
import { STATUSES, STATUS_LABELS } from "../lib/labels";
import { buttonClass } from "../lib/ui";
import type { ModerationStatus } from "../types/api-types";
import { QuestionItem } from "../components/forum/QuestionItem";
import { Select } from "../components/ui/Field";
import { PageHeader, Tabs } from "../components/ui/PageHeader";
import { Pagination } from "../components/ui/Pagination";
import { SearchInput } from "../components/ui/SearchInput";
import { EmptyState, ErrorState, PageLoader } from "../components/ui/States";

type Filter = "" | "open" | "solved" | "unanswered";

const FILTERS: { value: Filter; label: string }[] = [
    { value: "", label: "הכול" },
    { value: "open", label: "פתוחות" },
    { value: "unanswered", label: "ממתינות לתשובה" },
    { value: "solved", label: "נפתרו" },
];

export function ForumPage() {
    const { user, isAdmin } = useAuth();
    const { get, set } = useParamState();
    const categories = useCategories();

    const filter = (get("filter") || "") as Filter;
    const openId = Number(get("open")) || null;
    const showAll = isAdmin && get("scope") === "all";

    const query: QuestionQuery = {
        search: get("search") || undefined,
        categoryId: Number(get("categoryId")) || undefined,
        solved: filter === "solved" ? true : filter === "open" ? false : undefined,
        unanswered: filter === "unanswered" ? true : undefined,
        sort: get("sort") === "oldest" ? "oldest" : undefined,
        scope: showAll ? "all" : undefined,
        status: showAll ? ((get("status") || undefined) as ModerationStatus | undefined) : undefined,
        page: Number(get("page")) || 1,
        pageSize: 10,
    };

    const questions = useQuery({
        queryKey: ["forum", "questions", query],
        queryFn: () => getQuestions(query),
        placeholderData: keepPreviousData,
    });

    // שאלה שנפתחה מקישור (למשל מהתראה) ואינה בעמוד הנוכחי: טוענים אותה בנפרד
    const inList = questions.data?.items.some((q) => q.id === openId);
    const pinned = useQuery({
        queryKey: ["forum", "question", openId],
        queryFn: () => getQuestion(openId!),
        enabled: openId !== null && questions.isSuccess && !inList,
        retry: false,
    });

    // גלילה לשאלה שנפתחה מקישור חיצוני (התראה), ולא בלחיצה בתוך הרשימה
    const openedByClick = useRef(false);
    useEffect(() => {
        if (openedByClick.current) {
            openedByClick.current = false;
            return;
        }
        if (!openId) return;
        document.getElementById(`question-${openId}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, [openId, questions.isSuccess, pinned.isSuccess]);

    // פתיחה וסגירה של שאלה לא מחזירות לעמוד 1
    const toggle = (id: number) => {
        openedByClick.current = true;
        set({ open: openId === id ? undefined : String(id), page: get("page") || undefined });
    };

    const filtered = !!(query.search || query.categoryId || filter);

    return (
        <div className="space-y-6">
            <PageHeader
                title="פורום עזרה"
                description="נתקעתם באמצע מתכון? שואלים את הקהילה ומקבלים תשובה"
                action={
                    user ? (
                        <Link to="/forum/new" className={buttonClass("primary")}>
                            <Plus className="size-4" /> שאלה חדשה
                        </Link>
                    ) : (
                        <Link to="/login" state={{ from: "/forum/new" }} className={buttonClass("secondary")}>
                            התחברו כדי לשאול
                        </Link>
                    )
                }
            />

            <div className="flex flex-wrap items-center gap-3">
                <Tabs value={filter} options={FILTERS} onChange={(v) => set({ filter: v, open: undefined })} />
                <Select value={get("categoryId")} onChange={(e) => set({ categoryId: e.target.value })} className="w-auto" aria-label="קטגוריה">
                    <option value="">כל הקטגוריות</option>
                    {categories.data?.map((c) => (
                        <option key={c.id} value={c.id}>
                            {c.name}
                        </option>
                    ))}
                </Select>
                <Select value={get("sort")} onChange={(e) => set({ sort: e.target.value })} className="w-auto" aria-label="מיון">
                    <option value="">החדשות ביותר</option>
                    <option value="oldest">הישנות ביותר</option>
                </Select>
                <SearchInput
                    value={get("search")}
                    onChange={(v) => set({ search: v || undefined })}
                    placeholder="חיפוש בשאלות"
                    className="w-full lg:ms-auto lg:w-64"
                />
            </div>

            {isAdmin && (
                <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-brand-100 bg-brand-50/60 px-4 py-3">
                    <ShieldCheck className="size-5 text-brand-600" />
                    <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-stone-700">
                        <input
                            type="checkbox"
                            checked={showAll}
                            onChange={(e) => set({ scope: e.target.checked ? "all" : undefined, status: undefined })}
                            className="size-4 accent-brand-500"
                        />
                        הצגת כל השאלות (כולל ממתינות ונדחות)
                    </label>
                    {showAll && (
                        <Select value={get("status")} onChange={(e) => set({ status: e.target.value })} className="w-auto">
                            <option value="">כל הסטטוסים</option>
                            {STATUSES.map((s) => (
                                <option key={s} value={s}>
                                    {STATUS_LABELS[s]}
                                </option>
                            ))}
                        </Select>
                    )}
                </div>
            )}

            {questions.isPending ? (
                <PageLoader text="טוען שאלות..." />
            ) : questions.isError ? (
                <ErrorState message={getErrorMessage(questions.error)} onRetry={() => questions.refetch()} />
            ) : (
                <div className={questions.isPlaceholderData ? "opacity-60" : ""}>
                    {pinned.data && !inList && (
                        <div className="mb-6">
                            <p className="mb-2 text-xs font-medium text-stone-500">השאלה שבחרת</p>
                            <ul>
                                <QuestionItem question={pinned.data} open onToggle={() => toggle(pinned.data.id)} />
                            </ul>
                        </div>
                    )}

                    {questions.data.items.length === 0 ? (
                        <EmptyState
                            emoji={filtered ? "🔍" : "💬"}
                            title={filtered ? "לא נמצאו שאלות" : "עדיין אין שאלות בפורום"}
                            description={filtered ? "נסו סינון אחר או מילת חיפוש אחרת" : "יש לכם שאלה על בישול? זה המקום"}
                        />
                    ) : (
                        <>
                            <ul className="space-y-3">
                                {questions.data.items.map((q) => (
                                    <QuestionItem key={q.id} question={q} open={openId === q.id} onToggle={() => toggle(q.id)} />
                                ))}
                            </ul>
                            <Pagination
                                page={questions.data.page}
                                totalPages={questions.data.totalPages}
                                onChange={(p) => set({ page: p > 1 ? String(p) : undefined, open: undefined })}
                            />
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
