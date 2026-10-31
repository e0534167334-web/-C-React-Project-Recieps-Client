import { useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Carrot, Plus, ShieldCheck, SlidersHorizontal, X } from "lucide-react";
import { getRecipes, type RecipeQuery } from "../api/recipes";
import { getErrorMessage } from "../api/api";
import { useAuth } from "../context/useAuth";
import { useCategories } from "../hooks/useCategories";
import { useParamState } from "../hooks/useParamState";
import { DIFFICULTIES, DIFFICULTY_LABELS, KOSHER_LABELS, KOSHER_TYPES, STATUSES, STATUS_LABELS } from "../lib/labels";
import { buttonClass } from "../lib/ui";
import type { Difficulty, KosherType, ModerationStatus } from "../types/api-types";
import { RecipeCard, RecipeCardSkeleton, RecipeGrid } from "../components/recipes/RecipeCard";
import { Pagination } from "../components/ui/Pagination";
import { SearchInput } from "../components/ui/SearchInput";
import { Select } from "../components/ui/Field";
import { EmptyState, ErrorState } from "../components/ui/States";

const PREP_TIMES = [
    { value: "15", label: "עד רבע שעה" },
    { value: "30", label: "עד חצי שעה" },
    { value: "60", label: "עד שעה" },
    { value: "120", label: "עד שעתיים" },
];

const SORTS = [
    { value: "newest", label: "החדשים ביותר" },
    { value: "prepTime", label: "זמן הכנה קצר" },
    { value: "mostSaved", label: "הנשמרים ביותר" },
];

const FILTER_KEYS = ["categoryId", "difficulty", "kosherType", "maxPrepTime", "ingredients"];

export function HomePage() {
    const { user, isAdmin } = useAuth();
    const { get, set, clear } = useParamState();
    const categories = useCategories();
    const [showFilters, setShowFilters] = useState(() => FILTER_KEYS.some((k) => get(k)));

    const showAll = isAdmin && get("scope") === "all";

    const query: RecipeQuery = {
        search: get("search") || undefined,
        categoryId: Number(get("categoryId")) || undefined,
        difficulty: (get("difficulty") || undefined) as Difficulty | undefined,
        kosherType: (get("kosherType") || undefined) as KosherType | undefined,
        maxPrepTime: Number(get("maxPrepTime")) || undefined,
        ingredients: get("ingredients") || undefined,
        sort: (get("sort") || "newest") as RecipeQuery["sort"],
        scope: showAll ? "all" : undefined,
        status: showAll ? ((get("status") || undefined) as ModerationStatus | undefined) : undefined,
        page: Number(get("page")) || 1,
        pageSize: 12,
    };

    const recipes = useQuery({
        queryKey: ["recipes", "list", query],
        queryFn: () => getRecipes(query),
        placeholderData: keepPreviousData,
    });

    const activeFilters = FILTER_KEYS.filter((k) => get(k)).length;
    const hasAnyFilter = activeFilters > 0 || !!query.search;

    const onIngredients = (value: string) =>
        set({ ingredients: value.split(/[,،]/).map((s) => s.trim()).filter(Boolean).join(",") || undefined });

    return (
        <div className="space-y-8">
            <section className="relative overflow-hidden rounded-3xl bg-gradient-to-bl from-brand-100 via-orange-50 to-amber-50 px-6 py-10 sm:px-10 sm:py-14">
                <div className="pointer-events-none absolute -top-6 end-6 hidden text-[8rem] leading-none opacity-20 select-none sm:block" aria-hidden>
                    🍋
                </div>
                <div className="pointer-events-none absolute -bottom-8 end-40 hidden text-[6rem] leading-none opacity-15 select-none md:block" aria-hidden>
                    🌿
                </div>
                <div className="relative max-w-2xl">
                    <h1 className="text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">מה מבשלים היום?</h1>
                    <p className="mt-2 text-stone-600 sm:text-lg">
                        מתכונים ביתיים מהקהילה. מחפשים לפי שם, או לפי מה שיש לכם במקרר.
                    </p>
                    <SearchInput
                        large
                        value={get("search")}
                        onChange={(v) => set({ search: v || undefined })}
                        placeholder="חיפוש מתכון: שקשוקה, עוגת שוקולד..."
                        className="mt-6"
                    />
                </div>
            </section>

            <section className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setShowFilters((v) => !v)}
                        className={buttonClass(showFilters ? "primary" : "secondary", "md")}
                        aria-expanded={showFilters}
                    >
                        <SlidersHorizontal className="size-4" />
                        סינון
                        {activeFilters > 0 && (
                            <span className={`rounded-full px-1.5 text-xs ${showFilters ? "bg-white/25" : "bg-brand-100 text-brand-700"}`}>
                                {activeFilters}
                            </span>
                        )}
                    </button>

                    <div className="flex rounded-xl border border-stone-200 bg-white p-1 shadow-sm">
                        {KOSHER_TYPES.map((k) => (
                            <button
                                key={k}
                                type="button"
                                onClick={() => set({ kosherType: get("kosherType") === k ? undefined : k })}
                                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                                    get("kosherType") === k ? "bg-stone-900 text-white" : "text-stone-600 hover:bg-stone-100"
                                }`}
                                aria-pressed={get("kosherType") === k}
                            >
                                {KOSHER_LABELS[k]}
                            </button>
                        ))}
                    </div>

                    <div className="ms-auto flex items-center gap-2">
                        <label htmlFor="sort" className="hidden text-sm text-stone-500 sm:block">
                            מיון:
                        </label>
                        <Select
                            id="sort"
                            value={query.sort}
                            onChange={(e) => set({ sort: e.target.value === "newest" ? undefined : e.target.value })}
                            className="w-auto"
                        >
                            {SORTS.map((s) => (
                                <option key={s.value} value={s.value}>
                                    {s.label}
                                </option>
                            ))}
                        </Select>
                    </div>
                </div>

                {showFilters && (
                    <div className="grid animate-slide-up gap-4 rounded-2xl border border-stone-200/70 bg-white p-5 shadow-card sm:grid-cols-2 lg:grid-cols-4">
                        <div className="space-y-1.5">
                            <label htmlFor="category" className="text-sm font-medium text-stone-700">
                                קטגוריה
                            </label>
                            <Select id="category" value={get("categoryId")} onChange={(e) => set({ categoryId: e.target.value })}>
                                <option value="">כל הקטגוריות</option>
                                {categories.data?.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.name}
                                    </option>
                                ))}
                            </Select>
                        </div>
                        <div className="space-y-1.5">
                            <label htmlFor="difficulty" className="text-sm font-medium text-stone-700">
                                רמת קושי
                            </label>
                            <Select id="difficulty" value={get("difficulty")} onChange={(e) => set({ difficulty: e.target.value })}>
                                <option value="">כל הרמות</option>
                                {DIFFICULTIES.map((d) => (
                                    <option key={d} value={d}>
                                        {DIFFICULTY_LABELS[d]}
                                    </option>
                                ))}
                            </Select>
                        </div>
                        <div className="space-y-1.5">
                            <label htmlFor="prep" className="text-sm font-medium text-stone-700">
                                זמן הכנה
                            </label>
                            <Select id="prep" value={get("maxPrepTime")} onChange={(e) => set({ maxPrepTime: e.target.value })}>
                                <option value="">כל זמן</option>
                                {PREP_TIMES.map((p) => (
                                    <option key={p.value} value={p.value}>
                                        {p.label}
                                    </option>
                                ))}
                            </Select>
                        </div>
                        <div className="space-y-1.5">
                            <span className="flex items-center gap-1 text-sm font-medium text-stone-700">
                                <Carrot className="size-4 text-brand-500" /> מה יש לי בבית
                            </span>
                            <SearchInput
                                value={get("ingredients").replaceAll(",", ", ")}
                                onChange={onIngredients}
                                placeholder="ביצים, קישוא, גבינה"
                            />
                        </div>
                    </div>
                )}

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
                            הצגת כל המתכונים במערכת (כולל פרטיים, ממתינים ונדחים)
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

                <div className="flex min-h-6 items-center justify-between text-sm text-stone-500">
                    <span>
                        {recipes.data &&
                            (recipes.data.total === 1 ? "נמצא מתכון אחד" : `נמצאו ${recipes.data.total} מתכונים`)}
                    </span>
                    {hasAnyFilter && (
                        <button
                            type="button"
                            onClick={() => clear(["sort", "scope"])}
                            className="flex items-center gap-1 font-medium text-brand-600 hover:text-brand-700"
                        >
                            <X className="size-4" /> ניקוי הסינון
                        </button>
                    )}
                </div>
            </section>

            <section className={recipes.isPlaceholderData ? "opacity-60 transition-opacity" : "transition-opacity"}>
                {recipes.isPending ? (
                    <RecipeGrid>
                        {Array.from({ length: 8 }, (_, i) => (
                            <RecipeCardSkeleton key={i} />
                        ))}
                    </RecipeGrid>
                ) : recipes.isError ? (
                    <ErrorState message={getErrorMessage(recipes.error)} onRetry={() => recipes.refetch()} />
                ) : recipes.data.items.length === 0 ? (
                    <EmptyState
                        emoji={hasAnyFilter ? "🔍" : "🥄"}
                        title={hasAnyFilter ? "לא מצאנו מתכונים מתאימים" : "עדיין אין מתכונים"}
                        description={
                            hasAnyFilter
                                ? "נסו לחפש מילה אחרת, או להסיר חלק מהסינונים"
                                : "היו הראשונים לשתף מתכון עם הקהילה"
                        }
                        action={
                            hasAnyFilter ? (
                                <button type="button" onClick={() => clear(["sort", "scope"])} className={buttonClass("secondary")}>
                                    ניקוי הסינון
                                </button>
                            ) : (
                                <Link to={user ? "/recipes/new" : "/register"} className={buttonClass("primary")}>
                                    <Plus className="size-4" /> הוספת מתכון
                                </Link>
                            )
                        }
                    />
                ) : (
                    <>
                        <RecipeGrid>
                            {recipes.data.items.map((recipe) => (
                                <RecipeCard key={recipe.id} recipe={recipe} showStatus={showAll} />
                            ))}
                        </RecipeGrid>
                        <Pagination
                            page={recipes.data.page}
                            totalPages={recipes.data.totalPages}
                            onChange={(p) => set({ page: p > 1 ? String(p) : undefined })}
                        />
                    </>
                )}
            </section>
        </div>
    );
}
