import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Bookmark, ChefHat, Clock, Lock } from "lucide-react";
import { DIFFICULTY_LABELS, KOSHER_LABELS, formatPrepTime } from "../../lib/labels";
import type { CookbookItem, KosherType, RecipeListItem } from "../../types/api-types";
import { Badge, StatusBadge } from "../ui/Badge";
import { RecipeImage } from "./RecipeImage";

const KOSHER_TONES: Record<KosherType, "red" | "blue" | "green"> = {
    MEAT: "red",
    DAIRY: "blue",
    PAREVE: "green",
};

interface RecipeCardProps {
    recipe: RecipeListItem | CookbookItem;
    showStatus?: boolean;
    actions?: ReactNode;
}

export function RecipeCard({ recipe, showStatus, actions }: RecipeCardProps) {
    const prep = formatPrepTime(recipe.prepTimeMinutes);

    return (
        <article className="group flex flex-col overflow-hidden rounded-2xl border border-stone-200/70 bg-white shadow-card transition duration-200 hover:-translate-y-0.5 hover:shadow-card-hover">
            <Link to={`/recipes/${recipe.id}`} className="flex flex-1 flex-col">
                <div className="relative overflow-hidden">
                    <RecipeImage
                        imageUrl={recipe.imageUrl}
                        title={recipe.title}
                        category={recipe.category}
                        className="aspect-[16/9] w-full transition duration-300 group-hover:scale-105 sm:aspect-[4/3]"
                    />
                    <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-2">
                        <span className="rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium text-stone-700 shadow-sm backdrop-blur">
                            {recipe.category.name}
                        </span>
                        {recipe.saveCount > 0 && (
                            <span
                                className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium shadow-sm backdrop-blur ${
                                    recipe.isSaved ? "bg-brand-500 text-white" : "bg-white/90 text-stone-700"
                                }`}
                                title="נשמר לספרים"
                            >
                                <Bookmark className={`size-3.5 ${recipe.isSaved ? "fill-current" : ""}`} />
                                {recipe.saveCount}
                            </span>
                        )}
                    </div>
                </div>

                <div className="flex flex-1 flex-col gap-3 p-4">
                    {showStatus && (
                        <div className="flex flex-wrap gap-1.5">
                            <StatusBadge status={recipe.status} />
                            {recipe.visibility === "PRIVATE" && (
                                <Badge>
                                    <Lock className="size-3" /> פרטי
                                </Badge>
                            )}
                        </div>
                    )}
                    <div>
                        <h3 className="line-clamp-1 text-base font-semibold text-stone-900 transition group-hover:text-brand-600">
                            {recipe.title}
                        </h3>
                        {recipe.description && (
                            <p className="mt-1 line-clamp-2 text-sm text-stone-500">{recipe.description}</p>
                        )}
                    </div>
                    <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-stone-500">
                        {prep && (
                            <span className="flex items-center gap-1">
                                <Clock className="size-3.5" /> {prep}
                            </span>
                        )}
                        <span className="flex items-center gap-1">
                            <ChefHat className="size-3.5" /> {DIFFICULTY_LABELS[recipe.difficulty]}
                        </span>
                        <Badge tone={KOSHER_TONES[recipe.kosherType]}>{KOSHER_LABELS[recipe.kosherType]}</Badge>
                    </div>
                    <p className="border-t border-stone-100 pt-3 text-xs text-stone-400">
                        מאת <span className="font-medium text-stone-600">{recipe.author.displayName}</span>
                    </p>
                </div>
            </Link>
            {actions && <div className="flex gap-2 border-t border-stone-100 p-3">{actions}</div>}
        </article>
    );
}

export function RecipeCardSkeleton() {
    return (
        <div className="overflow-hidden rounded-2xl border border-stone-200/70 bg-white">
            <div className="aspect-[16/9] animate-pulse bg-stone-100 sm:aspect-[4/3]" />
            <div className="space-y-3 p-4">
                <div className="h-4 w-2/3 animate-pulse rounded bg-stone-100" />
                <div className="h-3 w-full animate-pulse rounded bg-stone-100" />
                <div className="h-3 w-1/2 animate-pulse rounded bg-stone-100" />
            </div>
        </div>
    );
}

export function RecipeGrid({ children }: { children: ReactNode }) {
    return <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{children}</div>;
}
