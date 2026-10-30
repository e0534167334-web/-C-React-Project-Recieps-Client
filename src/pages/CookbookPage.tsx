import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { BookmarkMinus } from "lucide-react";
import { getCookbook, removeFromCookbook } from "../api/recipes";
import { getErrorMessage } from "../api/api";
import { useToast } from "../context/useToast";
import { useParamState } from "../hooks/useParamState";
import { buttonClass } from "../lib/ui";
import { RecipeCard, RecipeCardSkeleton, RecipeGrid } from "../components/recipes/RecipeCard";
import { Button } from "../components/ui/Button";
import { PageHeader } from "../components/ui/PageHeader";
import { Pagination } from "../components/ui/Pagination";
import { SearchInput } from "../components/ui/SearchInput";
import { EmptyState, ErrorState } from "../components/ui/States";

export function CookbookPage() {
    const { get, set } = useParamState();
    const toast = useToast();
    const queryClient = useQueryClient();

    const query = {
        search: get("search") || undefined,
        page: Number(get("page")) || 1,
        pageSize: 12,
    };

    const cookbook = useQuery({
        queryKey: ["cookbook", query],
        queryFn: () => getCookbook(query),
        placeholderData: keepPreviousData,
    });

    const remove = useMutation({
        mutationFn: removeFromCookbook,
        onSuccess: (_, recipeId) => {
            queryClient.invalidateQueries({ queryKey: ["cookbook"] });
            queryClient.invalidateQueries({ queryKey: ["recipe", recipeId] });
            queryClient.invalidateQueries({ queryKey: ["recipes"] });
            toast("המתכון הוסר מהספר");
        },
        onError: (error) => toast(getErrorMessage(error), "error"),
    });

    return (
        <div className="space-y-6">
            <PageHeader
                title="הספר שלי"
                description="המתכונים ששמרת, במקום אחד"
                action={
                    <SearchInput
                        value={get("search")}
                        onChange={(v) => set({ search: v || undefined })}
                        placeholder="חיפוש בספר"
                        className="w-full sm:w-64"
                    />
                }
            />

            {cookbook.isPending ? (
                <RecipeGrid>
                    {Array.from({ length: 4 }, (_, i) => (
                        <RecipeCardSkeleton key={i} />
                    ))}
                </RecipeGrid>
            ) : cookbook.isError ? (
                <ErrorState message={getErrorMessage(cookbook.error)} onRetry={() => cookbook.refetch()} />
            ) : cookbook.data.items.length === 0 ? (
                query.search ? (
                    <EmptyState emoji="🔍" title="לא נמצאו מתכונים בספר" description="נסו מילת חיפוש אחרת" />
                ) : (
                    <EmptyState
                        emoji="📖"
                        title="הספר שלך עדיין ריק"
                        description='מצאו מתכון שאהבתם ולחצו על "שמירה לספר". הוא יחכה לכם כאן.'
                        action={
                            <Link to="/" className={buttonClass("primary")}>
                                לגלות מתכונים
                            </Link>
                        }
                    />
                )
            ) : (
                <div className={cookbook.isPlaceholderData ? "opacity-60" : ""}>
                    <RecipeGrid>
                        {cookbook.data.items.map((recipe) => (
                            <RecipeCard
                                key={recipe.id}
                                recipe={recipe}
                                actions={
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="w-full"
                                        loading={remove.isPending && remove.variables === recipe.id}
                                        onClick={() => remove.mutate(recipe.id)}
                                    >
                                        <BookmarkMinus className="size-4" /> הסרה מהספר
                                    </Button>
                                }
                            />
                        ))}
                    </RecipeGrid>
                    <Pagination
                        page={cookbook.data.page}
                        totalPages={cookbook.data.totalPages}
                        onChange={(p) => set({ page: p > 1 ? String(p) : undefined })}
                    />
                </div>
            )}
        </div>
    );
}
