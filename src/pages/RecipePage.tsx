import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
    ArrowRight,
    Bookmark,
    ChefHat,
    Clock,
    Lock,
    Mail,
    Pencil,
    Phone,
    PlayCircle,
    Trash2,
    Users,
} from "lucide-react";
import { deleteRecipe, getRecipe, removeFromCookbook, saveToCookbook } from "../api/recipes";
import { getErrorMessage, getErrorStatus } from "../api/api";
import { useAuth } from "../context/useAuth";
import { useToast } from "../context/useToast";
import { DIFFICULTY_LABELS, KOSHER_LABELS, formatPrepTime, formatRelativeDate } from "../lib/labels";
import { buttonClass, cardClass } from "../lib/ui";
import { RecipeImage } from "../components/recipes/RecipeImage";
import { Badge, StatusBadge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { ConfirmDialog } from "../components/ui/Modal";
import { EmptyState, ErrorState, PageLoader } from "../components/ui/States";

export function RecipePage() {
    const id = Number(useParams().id);
    const { user } = useAuth();
    const toast = useToast();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [checked, setChecked] = useState<Set<number>>(new Set());

    const recipeQuery = useQuery({
        queryKey: ["recipe", id],
        queryFn: () => getRecipe(id),
        enabled: Number.isInteger(id),
    });

    const refreshSaved = () => {
        queryClient.invalidateQueries({ queryKey: ["recipe", id] });
        queryClient.invalidateQueries({ queryKey: ["recipes"] });
        queryClient.invalidateQueries({ queryKey: ["cookbook"] });
    };

    const save = useMutation({
        mutationFn: async (saved: boolean) => {
            if (saved) await removeFromCookbook(id);
            else await saveToCookbook(id);
        },
        onSuccess: (_, wasSaved) => {
            toast(wasSaved ? "המתכון הוסר מהספר שלך" : "המתכון נשמר בספר שלך 📖");
            refreshSaved();
        },
        onError: (error) => toast(getErrorMessage(error), "error"),
    });

    const remove = useMutation({
        mutationFn: () => deleteRecipe(id),
        onSuccess: () => {
            queryClient.removeQueries({ queryKey: ["recipe", id] });
            queryClient.invalidateQueries({ queryKey: ["recipes"] });
            queryClient.invalidateQueries({ queryKey: ["cookbook"] });
            toast("המתכון נמחק");
            navigate("/", { replace: true });
        },
        onError: (error) => {
            setConfirmDelete(false);
            toast(getErrorMessage(error), "error");
        },
    });

    if (recipeQuery.isPending && Number.isInteger(id)) return <PageLoader text="טוען את המתכון..." />;

    if (!Number.isInteger(id) || getErrorStatus(recipeQuery.error) === 404) {
        return (
            <EmptyState
                emoji="🍳"
                title="המתכון לא נמצא"
                description="ייתכן שהמתכון נמחק, או שהוא פרטי."
                action={
                    <Link to="/" className={buttonClass("primary")}>
                        לכל המתכונים
                    </Link>
                }
            />
        );
    }

    if (recipeQuery.isError) {
        return <ErrorState message={getErrorMessage(recipeQuery.error)} onRetry={() => recipeQuery.refetch()} />;
    }

    const recipe = recipeQuery.data!;
    const prep = formatPrepTime(recipe.prepTimeMinutes);
    const isMine = user?.id === recipe.author.id;
    const steps = recipe.instructions.split("\n").map((s) => s.trim()).filter(Boolean);
    const hasContact = recipe.author.contactEmail || recipe.author.contactPhone;

    const toggleIngredient = (index: number) =>
        setChecked((current) => {
            const next = new Set(current);
            if (next.has(index)) next.delete(index);
            else next.add(index);
            return next;
        });

    return (
        <article className="mx-auto max-w-4xl animate-fade-in space-y-6">
            <Link to="/" className="inline-flex items-center gap-1 text-sm font-medium text-stone-500 hover:text-stone-800">
                <ArrowRight className="size-4" /> לכל המתכונים
            </Link>

            {isMine && recipe.status === "PENDING" && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
                    <p className="font-semibold">המתכון ממתין לאישור מנהל</p>
                    <p className="mt-0.5 text-amber-800">מתכון ציבורי עם תמונה או סרטון יוצג לאחרים אחרי שיאושר.</p>
                </div>
            )}
            {recipe.status === "REJECTED" && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-900">
                    <p className="font-semibold">המתכון נדחה</p>
                    {recipe.rejectionReason && <p className="mt-0.5">סיבה: {recipe.rejectionReason}</p>}
                    {isMine && <p className="mt-1 text-red-800">אפשר לערוך את המתכון, והוא יישלח שוב לאישור.</p>}
                </div>
            )}

            <header className={`${cardClass} overflow-hidden`}>
                <RecipeImage
                    imageUrl={recipe.imageUrl}
                    title={recipe.title}
                    category={recipe.category}
                    className="h-56 w-full sm:h-72"
                    emojiSize="text-8xl"
                />
                <div className="space-y-5 p-6 sm:p-8">
                    <div className="flex flex-wrap items-center gap-2">
                        <Link to={`/?categoryId=${recipe.category.id}`}>
                            <Badge tone="brand">{recipe.category.name}</Badge>
                        </Link>
                        <Badge>{KOSHER_LABELS[recipe.kosherType]}</Badge>
                        {(isMine || recipe.status !== "APPROVED") && <StatusBadge status={recipe.status} />}
                        {recipe.visibility === "PRIVATE" && (
                            <Badge>
                                <Lock className="size-3" /> פרטי
                            </Badge>
                        )}
                    </div>

                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">{recipe.title}</h1>
                        {recipe.description && <p className="mt-2 text-lg text-stone-600">{recipe.description}</p>}
                    </div>

                    <dl className="grid grid-cols-3 gap-3 rounded-2xl bg-stone-50 p-4 text-center">
                        <div>
                            <dt className="flex items-center justify-center gap-1 text-xs text-stone-500">
                                <Clock className="size-3.5" /> זמן הכנה
                            </dt>
                            <dd className="mt-1 font-semibold text-stone-800">{prep ?? "—"}</dd>
                        </div>
                        <div className="border-x border-stone-200">
                            <dt className="flex items-center justify-center gap-1 text-xs text-stone-500">
                                <ChefHat className="size-3.5" /> רמת קושי
                            </dt>
                            <dd className="mt-1 font-semibold text-stone-800">{DIFFICULTY_LABELS[recipe.difficulty]}</dd>
                        </div>
                        <div>
                            <dt className="flex items-center justify-center gap-1 text-xs text-stone-500">
                                <Users className="size-3.5" /> מנות
                            </dt>
                            <dd className="mt-1 font-semibold text-stone-800">{recipe.servings ?? "—"}</dd>
                        </div>
                    </dl>

                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <span className="flex size-10 items-center justify-center rounded-full bg-gradient-to-br from-brand-300 to-brand-500 font-semibold text-white">
                                {recipe.author.displayName.charAt(0)}
                            </span>
                            <div className="text-sm">
                                <p className="font-medium text-stone-800">{recipe.author.displayName}</p>
                                <p className="text-stone-500">{formatRelativeDate(recipe.createdAt)}</p>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {user ? (
                                <Button
                                    variant={recipe.isSaved ? "secondary" : "primary"}
                                    loading={save.isPending}
                                    onClick={() => save.mutate(recipe.isSaved)}
                                >
                                    <Bookmark className={`size-4 ${recipe.isSaved ? "fill-brand-500 text-brand-500" : ""}`} />
                                    {recipe.isSaved ? "שמור בספר שלי" : "שמירה לספר"}
                                </Button>
                            ) : (
                                <Link to="/login" state={{ from: `/recipes/${id}` }} className={buttonClass("secondary")}>
                                    <Bookmark className="size-4" /> התחברו כדי לשמור
                                </Link>
                            )}
                            {recipe.permissions.canEdit && (
                                <Link to={`/recipes/${id}/edit`} className={buttonClass("secondary")}>
                                    <Pencil className="size-4" /> עריכה
                                </Link>
                            )}
                            {recipe.permissions.canDelete && (
                                <Button variant="ghost" className="text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => setConfirmDelete(true)}>
                                    <Trash2 className="size-4" /> מחיקה
                                </Button>
                            )}
                        </div>
                    </div>

                    {recipe.saveCount > 0 && (
                        <p className="text-xs text-stone-500">
                            {recipe.saveCount === 1 ? "נשמר בספר אחד" : `נשמר ב־${recipe.saveCount} ספרים`}
                        </p>
                    )}
                </div>
            </header>

            <div className="grid gap-6 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
                <section className={`${cardClass} h-fit p-6`}>
                    <h2 className="mb-1 text-lg font-semibold text-stone-900">רכיבים</h2>
                    <p className="mb-4 text-xs text-stone-500">סמנו את מה שכבר הכנתם</p>
                    <ul className="space-y-1">
                        {recipe.ingredients.map((ing, i) => (
                            <li key={i}>
                                <label className="flex cursor-pointer items-start gap-3 rounded-lg px-2 py-1.5 transition hover:bg-stone-50">
                                    <input
                                        type="checkbox"
                                        checked={checked.has(i)}
                                        onChange={() => toggleIngredient(i)}
                                        className="mt-1 size-4 accent-brand-500"
                                    />
                                    <span className={`text-sm ${checked.has(i) ? "text-stone-400 line-through" : "text-stone-700"}`}>
                                        {ing}
                                    </span>
                                </label>
                            </li>
                        ))}
                    </ul>
                </section>

                <section className={`${cardClass} p-6`}>
                    <h2 className="mb-4 text-lg font-semibold text-stone-900">אופן ההכנה</h2>
                    {steps.length > 1 ? (
                        <ol className="space-y-4">
                            {steps.map((step, i) => (
                                <li key={i} className="flex gap-4">
                                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-brand-50 text-sm font-semibold text-brand-700">
                                        {i + 1}
                                    </span>
                                    <p className="pt-0.5 leading-relaxed text-stone-700">{step}</p>
                                </li>
                            ))}
                        </ol>
                    ) : (
                        <p className="leading-relaxed whitespace-pre-line text-stone-700">{recipe.instructions}</p>
                    )}

                    {recipe.videoUrl && (
                        <a
                            href={recipe.videoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-6 flex items-center gap-3 rounded-2xl border border-stone-200 p-4 transition hover:border-brand-300 hover:bg-brand-50/50"
                        >
                            <PlayCircle className="size-8 text-brand-500" />
                            <span>
                                <span className="block font-medium text-stone-800">צפייה בסרטון ההכנה</span>
                                <span className="block text-xs text-stone-500">נפתח בחלון חדש</span>
                            </span>
                        </a>
                    )}
                </section>
            </div>

            {hasContact && (
                <section className={`${cardClass} p-6`}>
                    <h2 className="mb-3 text-lg font-semibold text-stone-900">יצירת קשר עם {recipe.author.displayName}</h2>
                    <div className="flex flex-wrap gap-3">
                        {recipe.author.contactEmail && (
                            <a href={`mailto:${recipe.author.contactEmail}`} className={buttonClass("secondary")}>
                                <Mail className="size-4" />
                                <span dir="ltr">{recipe.author.contactEmail}</span>
                            </a>
                        )}
                        {recipe.author.contactPhone && (
                            <a href={`tel:${recipe.author.contactPhone}`} className={buttonClass("secondary")}>
                                <Phone className="size-4" />
                                <span dir="ltr">{recipe.author.contactPhone}</span>
                            </a>
                        )}
                    </div>
                </section>
            )}

            <ConfirmDialog
                open={confirmDelete}
                title="למחוק את המתכון?"
                message={`המתכון "${recipe.title}" יימחק לצמיתות, וגם יוסר מהספרים של מי ששמר אותו.`}
                loading={remove.isPending}
                onConfirm={() => remove.mutate()}
                onClose={() => setConfirmDelete(false)}
            />
        </article>
    );
}
