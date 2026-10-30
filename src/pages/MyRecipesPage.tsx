import { useState } from "react";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { deleteRecipe, getMyRecipes } from "../api/recipes";
import { getErrorMessage } from "../api/api";
import { useToast } from "../context/useToast";
import { useParamState } from "../hooks/useParamState";
import { buttonClass } from "../lib/ui";
import type { ModerationStatus, RecipeListItem, Visibility } from "../types/api-types";
import { RecipeCard, RecipeCardSkeleton, RecipeGrid } from "../components/recipes/RecipeCard";
import { Button } from "../components/ui/Button";
import { Select } from "../components/ui/Field";
import { ConfirmDialog } from "../components/ui/Modal";
import { PageHeader, Tabs } from "../components/ui/PageHeader";
import { Pagination } from "../components/ui/Pagination";
import { SearchInput } from "../components/ui/SearchInput";
import { EmptyState, ErrorState } from "../components/ui/States";

type StatusTab = "" | ModerationStatus;

const STATUS_TABS: { value: StatusTab; label: string }[] = [
    { value: "", label: "הכול" },
    { value: "APPROVED", label: "מאושרים" },
    { value: "PENDING", label: "ממתינים" },
    { value: "REJECTED", label: "נדחו" },
];

export function MyRecipesPage() {
    const { get, set } = useParamState();
    const toast = useToast();
    const queryClient = useQueryClient();
    const [toDelete, setToDelete] = useState<RecipeListItem | null>(null);

    const query = {
        status: (get("status") || undefined) as ModerationStatus | undefined,
        visibility: (get("visibility") || undefined) as Visibility | undefined,
        search: get("search") || undefined,
        page: Number(get("page")) || 1,
        pageSize: 12,
    };

    const recipes = useQuery({
        queryKey: ["recipes", "mine", query],
        queryFn: () => getMyRecipes(query),
        placeholderData: keepPreviousData,
    });

    const remove = useMutation({
        mutationFn: (id: number) => deleteRecipe(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["recipes"] });
            queryClient.invalidateQueries({ queryKey: ["cookbook"] });
            toast("המתכון נמחק");
            setToDelete(null);
        },
        onError: (error) => {
            toast(getErrorMessage(error), "error");
            setToDelete(null);
        },
    });

    const filtered = !!(query.status || query.visibility || query.search);

    return (
        <div className="space-y-6">
            <PageHeader
                title="המתכונים שלי"
                description="כל המתכונים שכתבת: ציבוריים, פרטיים, ממתינים ונדחים"
                action={
                    <Link to="/recipes/new" className={buttonClass("primary")}>
                        <Plus className="size-4" /> מתכון חדש
                    </Link>
                }
            />

            <div className="flex flex-wrap items-center gap-3">
                <Tabs value={(get("status") || "") as StatusTab} options={STATUS_TABS} onChange={(v) => set({ status: v })} />
                <Select value={get("visibility")} onChange={(e) => set({ visibility: e.target.value })} className="w-auto" aria-label="נראות">
                    <option value="">ציבוריים ופרטיים</option>
                    <option value="PUBLIC">ציבוריים בלבד</option>
                    <option value="PRIVATE">פרטיים בלבד</option>
                </Select>
                <SearchInput
                    value={get("search")}
                    onChange={(v) => set({ search: v || undefined })}
                    placeholder="חיפוש במתכונים שלי"
                    className="w-full sm:ms-auto sm:w-64"
                />
            </div>

            {recipes.isPending ? (
                <RecipeGrid>
                    {Array.from({ length: 4 }, (_, i) => (
                        <RecipeCardSkeleton key={i} />
                    ))}
                </RecipeGrid>
            ) : recipes.isError ? (
                <ErrorState message={getErrorMessage(recipes.error)} onRetry={() => recipes.refetch()} />
            ) : recipes.data.items.length === 0 ? (
                filtered ? (
                    <EmptyState emoji="🔍" title="אין מתכונים שמתאימים לסינון" description="נסו לבחור סטטוס אחר או לנקות את החיפוש" />
                ) : (
                    <EmptyState
                        emoji="📝"
                        title="עוד לא כתבת מתכונים"
                        description="המתכון הראשון שלך במרחק לחיצה. אפשר לשמור אותו כפרטי, או לשתף עם כולם."
                        action={
                            <Link to="/recipes/new" className={buttonClass("primary")}>
                                <Plus className="size-4" /> כתיבת מתכון
                            </Link>
                        }
                    />
                )
            ) : (
                <div className={recipes.isPlaceholderData ? "opacity-60" : ""}>
                    <RecipeGrid>
                        {recipes.data.items.map((recipe) => (
                            <RecipeCard
                                key={recipe.id}
                                recipe={recipe}
                                showStatus
                                actions={
                                    <>
                                        <Link to={`/recipes/${recipe.id}/edit`} className={buttonClass("secondary", "sm", "flex-1")}>
                                            <Pencil className="size-3.5" /> עריכה
                                        </Link>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="flex-1 text-red-600 hover:bg-red-50 hover:text-red-700"
                                            onClick={() => setToDelete(recipe)}
                                        >
                                            <Trash2 className="size-3.5" /> מחיקה
                                        </Button>
                                    </>
                                }
                            />
                        ))}
                    </RecipeGrid>
                    <Pagination
                        page={recipes.data.page}
                        totalPages={recipes.data.totalPages}
                        onChange={(p) => set({ page: p > 1 ? String(p) : undefined })}
                    />
                </div>
            )}

            <ConfirmDialog
                open={toDelete !== null}
                title="למחוק את המתכון?"
                message={toDelete && `המתכון "${toDelete.title}" יימחק לצמיתות.`}
                loading={remove.isPending}
                onConfirm={() => toDelete && remove.mutate(toDelete.id)}
                onClose={() => setToDelete(null)}
            />
        </div>
    );
}
