import { useEffect, type ReactNode } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowRight, Globe, Info, Lock } from "lucide-react";
import { createRecipe, getRecipe, updateRecipe, type RecipeInput } from "../api/recipes";
import { getErrorMessage, getErrorStatus, getFieldErrors } from "../api/api";
import { useToast } from "../context/useToast";
import { useCategories } from "../hooks/useCategories";
import { DIFFICULTIES, DIFFICULTY_LABELS, KOSHER_LABELS, KOSHER_TYPES } from "../lib/labels";
import { buttonClass, cardClass } from "../lib/ui";
import type { RecipeDetail } from "../types/api-types";
import { Button } from "../components/ui/Button";
import { Checkbox, Field, Input, Select, Textarea } from "../components/ui/Field";
import { EmptyState, ErrorState, PageLoader } from "../components/ui/States";

const optionalInt = (min: number, max: number, message: string) =>
    z
        .string()
        .trim()
        .refine((v) => v === "" || (Number.isInteger(Number(v)) && Number(v) >= min && Number(v) <= max), message);

const recipeSchema = z.object({
    title: z.string().trim().min(2, "שם המתכון חייב להכיל 2 תווים לפחות").max(100, "עד 100 תווים"),
    description: z.string().trim().max(500, "עד 500 תווים"),
    categoryId: z.string().min(1, "יש לבחור קטגוריה"),
    difficulty: z.enum(["EASY", "MEDIUM", "HARD"], { message: "יש לבחור רמת קושי" }),
    kosherType: z.enum(["MEAT", "DAIRY", "PAREVE"], { message: "יש לבחור בשרי, חלבי או פרווה" }),
    prepTimeMinutes: optionalInt(1, 1440, "מספר דקות בין 1 ל־1440"),
    servings: optionalInt(1, 100, "מספר מנות בין 1 ל־100"),
    ingredients: z
        .string()
        .refine((v) => v.split("\n").some((line) => line.trim()), "יש להזין לפחות רכיב אחד")
        .refine((v) => v.split("\n").filter((line) => line.trim()).length <= 100, "עד 100 רכיבים")
        .refine((v) => v.split("\n").every((line) => line.trim().length <= 200), "כל רכיב עד 200 תווים"),
    instructions: z.string().trim().min(10, "אופן ההכנה חייב להכיל 10 תווים לפחות").max(10000, "עד 10,000 תווים"),
    videoUrl: z
        .string()
        .trim()
        .refine((v) => v === "" || /^https:\/\/\S+\.\S+/.test(v), "קישור תקין שמתחיל ב־https://"),
    visibility: z.enum(["PUBLIC", "PRIVATE"]),
    showContact: z.boolean(),
});

type RecipeFormData = z.infer<typeof recipeSchema>;

const EMPTY: RecipeFormData = {
    title: "",
    description: "",
    categoryId: "",
    difficulty: "" as RecipeFormData["difficulty"],
    kosherType: "" as RecipeFormData["kosherType"],
    prepTimeMinutes: "",
    servings: "",
    ingredients: "",
    instructions: "",
    videoUrl: "",
    visibility: "PUBLIC",
    showContact: false,
};

function toFormData(recipe: RecipeDetail): RecipeFormData {
    return {
        title: recipe.title,
        description: recipe.description ?? "",
        categoryId: String(recipe.category.id),
        difficulty: recipe.difficulty,
        kosherType: recipe.kosherType,
        prepTimeMinutes: recipe.prepTimeMinutes?.toString() ?? "",
        servings: recipe.servings?.toString() ?? "",
        ingredients: recipe.ingredients.join("\n"),
        instructions: recipe.instructions,
        videoUrl: recipe.videoUrl ?? "",
        visibility: recipe.visibility,
        showContact: recipe.showContact,
    };
}

function toInput(data: RecipeFormData): RecipeInput {
    return {
        title: data.title.trim(),
        description: data.description.trim() || null,
        categoryId: Number(data.categoryId),
        difficulty: data.difficulty,
        kosherType: data.kosherType,
        prepTimeMinutes: data.prepTimeMinutes ? Number(data.prepTimeMinutes) : null,
        servings: data.servings ? Number(data.servings) : null,
        ingredients: data.ingredients,
        instructions: data.instructions.trim(),
        videoUrl: data.videoUrl.trim() || null,
        visibility: data.visibility,
        showContact: data.showContact,
    };
}

function Section({ title, children }: { title: string; children: ReactNode }) {
    return (
        <section className={`${cardClass} p-6 sm:p-7`}>
            <h2 className="mb-5 text-lg font-semibold text-stone-900">{title}</h2>
            <div className="space-y-5">{children}</div>
        </section>
    );
}

export function RecipeFormPage() {
    const params = useParams();
    const editId = params.id ? Number(params.id) : null;
    const isEdit = editId !== null;
    const navigate = useNavigate();
    const toast = useToast();
    const queryClient = useQueryClient();
    const categories = useCategories();

    const existing = useQuery({
        queryKey: ["recipe", editId],
        queryFn: () => getRecipe(editId!),
        enabled: isEdit,
    });

    const {
        register,
        control,
        handleSubmit,
        reset,
        setError,
        formState: { errors, dirtyFields, isDirty },
    } = useForm<RecipeFormData>({
        resolver: zodResolver(recipeSchema),
        defaultValues: EMPTY,
    });

    useEffect(() => {
        if (existing.data) reset(toFormData(existing.data));
    }, [existing.data, reset]);

    const mutation = useMutation({
        mutationFn: (data: RecipeFormData) => {
            const input = toInput(data);
            if (!isEdit) return createRecipe(input);
            const changed = Object.fromEntries(
                Object.keys(dirtyFields).map((key) => [key, input[key as keyof RecipeInput]])
            ) as Partial<RecipeInput>;
            return updateRecipe(editId, changed);
        },
        onSuccess: (recipe) => {
            queryClient.invalidateQueries({ queryKey: ["recipes"] });
            queryClient.setQueryData(["recipe", recipe.id], recipe);
            toast(
                recipe.status === "PENDING"
                    ? "המתכון נשמר ויפורסם אחרי אישור מנהל"
                    : isEdit
                      ? "השינויים נשמרו"
                      : "המתכון פורסם בהצלחה 🎉"
            );
            navigate(`/recipes/${recipe.id}`);
        },
        onError: (error) => {
            for (const { field, message } of getFieldErrors(error)) {
                if (field in EMPTY) setError(field as keyof RecipeFormData, { message });
            }
        },
    });

    const [visibility, videoUrl] = useWatch({ control, name: ["visibility", "videoUrl"] });
    const hasMedia = !!videoUrl?.trim() || !!existing.data?.imageUrl;

    if (isEdit && existing.isPending) return <PageLoader text="טוען את המתכון..." />;
    if (isEdit && getErrorStatus(existing.error) === 404) {
        return <EmptyState emoji="🍳" title="המתכון לא נמצא" action={<Link to="/" className={buttonClass("primary")}>לכל המתכונים</Link>} />;
    }
    if (isEdit && existing.isError) {
        return <ErrorState message={getErrorMessage(existing.error)} onRetry={() => existing.refetch()} />;
    }
    if (isEdit && existing.data && !existing.data.permissions.canEdit) {
        return <EmptyState emoji="🔒" title="אין לך הרשאה לערוך את המתכון הזה" action={<Link to={`/recipes/${editId}`} className={buttonClass("secondary")}>חזרה למתכון</Link>} />;
    }

    const serverError = mutation.error && getFieldErrors(mutation.error).length === 0;

    return (
        <div className="mx-auto max-w-3xl animate-fade-in space-y-6">
            <div>
                <Link
                    to={isEdit ? `/recipes/${editId}` : "/my-recipes"}
                    className="inline-flex items-center gap-1 text-sm font-medium text-stone-500 hover:text-stone-800"
                >
                    <ArrowRight className="size-4" /> {isEdit ? "חזרה למתכון" : "המתכונים שלי"}
                </Link>
                <h1 className="mt-3 text-3xl font-bold tracking-tight text-stone-900">
                    {isEdit ? "עריכת מתכון" : "מתכון חדש"}
                </h1>
                <p className="mt-1 text-stone-500">
                    {isEdit ? existing.data?.title : "שתפו את המתכון שלכם עם הקהילה, או שמרו אותו לעצמכם"}
                </p>
            </div>

            <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-6" noValidate>
                <Section title="פרטי המתכון">
                    <Field label="שם המתכון" htmlFor="title" error={errors.title?.message} required>
                        <Input id="title" placeholder="למשל: שקשוקה ירוקה" aria-invalid={!!errors.title} {...register("title")} />
                    </Field>
                    <Field label="תיאור קצר" htmlFor="description" error={errors.description?.message} hint="משפט או שניים שיופיעו בכרטיס המתכון">
                        <Input id="description" placeholder="ארוחת בוקר מהירה ומשביעה" {...register("description")} />
                    </Field>
                    <div className="grid gap-5 sm:grid-cols-3">
                        <Field label="קטגוריה" htmlFor="categoryId" error={errors.categoryId?.message} required>
                            <Select id="categoryId" aria-invalid={!!errors.categoryId} {...register("categoryId")}>
                                <option value="">בחירה...</option>
                                {categories.data?.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.name}
                                    </option>
                                ))}
                            </Select>
                        </Field>
                        <Field label="רמת קושי" htmlFor="difficulty" error={errors.difficulty?.message} required>
                            <Select id="difficulty" aria-invalid={!!errors.difficulty} {...register("difficulty")}>
                                <option value="">בחירה...</option>
                                {DIFFICULTIES.map((d) => (
                                    <option key={d} value={d}>
                                        {DIFFICULTY_LABELS[d]}
                                    </option>
                                ))}
                            </Select>
                        </Field>
                        <Field label="סוג" htmlFor="kosherType" error={errors.kosherType?.message} required>
                            <Select id="kosherType" aria-invalid={!!errors.kosherType} {...register("kosherType")}>
                                <option value="">בחירה...</option>
                                {KOSHER_TYPES.map((k) => (
                                    <option key={k} value={k}>
                                        {KOSHER_LABELS[k]}
                                    </option>
                                ))}
                            </Select>
                        </Field>
                    </div>
                    <div className="grid gap-5 sm:grid-cols-2">
                        <Field label="זמן הכנה (בדקות)" htmlFor="prepTimeMinutes" error={errors.prepTimeMinutes?.message}>
                            <Input id="prepTimeMinutes" type="number" inputMode="numeric" min={1} max={1440} placeholder="30" aria-invalid={!!errors.prepTimeMinutes} {...register("prepTimeMinutes")} />
                        </Field>
                        <Field label="מספר מנות" htmlFor="servings" error={errors.servings?.message}>
                            <Input id="servings" type="number" inputMode="numeric" min={1} max={100} placeholder="4" aria-invalid={!!errors.servings} {...register("servings")} />
                        </Field>
                    </div>
                </Section>

                <Section title="רכיבים והכנה">
                    <Field label="רכיבים" htmlFor="ingredients" error={errors.ingredients?.message} hint="רכיב אחד בכל שורה" required>
                        <Textarea
                            id="ingredients"
                            rows={7}
                            placeholder={"6 ביצים\n2 קישואים\nחופן תרד\n100 גרם פטה"}
                            aria-invalid={!!errors.ingredients}
                            {...register("ingredients")}
                        />
                    </Field>
                    <Field label="אופן ההכנה" htmlFor="instructions" error={errors.instructions?.message} hint="כל שורה תוצג כשלב נפרד" required>
                        <Textarea
                            id="instructions"
                            rows={8}
                            placeholder={"מטגנים את הקישואים והתרד.\nשוברים מעל את הביצים ומכסים.\nמפזרים פטה ומגישים."}
                            aria-invalid={!!errors.instructions}
                            {...register("instructions")}
                        />
                    </Field>
                    <Field label="קישור לסרטון" htmlFor="videoUrl" error={errors.videoUrl?.message} hint="רשות. למשל קישור ל־YouTube">
                        <Input id="videoUrl" type="url" dir="ltr" placeholder="https://www.youtube.com/watch?v=..." aria-invalid={!!errors.videoUrl} {...register("videoUrl")} />
                    </Field>
                </Section>

                <Section title="פרסום">
                    <div className="grid gap-3 sm:grid-cols-2">
                        {(
                            [
                                { value: "PUBLIC", icon: Globe, title: "ציבורי", text: "כולם יוכלו לראות את המתכון" },
                                { value: "PRIVATE", icon: Lock, title: "פרטי", text: "רק את/ה רואה את המתכון" },
                            ] as const
                        ).map((option) => (
                            <label
                                key={option.value}
                                className={`flex cursor-pointer items-start gap-3 rounded-2xl border-2 p-4 transition ${
                                    visibility === option.value ? "border-brand-400 bg-brand-50/50" : "border-stone-200 hover:border-stone-300"
                                }`}
                            >
                                <input type="radio" value={option.value} className="sr-only" {...register("visibility")} />
                                <option.icon className={`mt-0.5 size-5 ${visibility === option.value ? "text-brand-600" : "text-stone-400"}`} />
                                <span>
                                    <span className="block font-medium text-stone-800">{option.title}</span>
                                    <span className="block text-sm text-stone-500">{option.text}</span>
                                </span>
                            </label>
                        ))}
                    </div>

                    {visibility === "PUBLIC" && hasMedia && (
                        <div className="flex gap-3 rounded-2xl bg-sky-50 px-4 py-3 text-sm text-sky-900">
                            <Info className="mt-0.5 size-4 shrink-0" />
                            <p>
                                מתכון ציבורי עם תמונה או סרטון יתפרסם לאחר אישור מנהל.
                                {isEdit && " גם עריכה שלו תשלח אותו שוב לאישור."}
                            </p>
                        </div>
                    )}

                    <Checkbox
                        id="showContact"
                        label="הצגת פרטי הקשר שלי"
                        description={
                            <>
                                פרטי הקשר מהפרופיל יוצגו ליד המתכון לכל מבקרי האתר.{" "}
                                <Link to="/profile" className="text-brand-600 hover:underline">
                                    עריכת פרטי הקשר
                                </Link>
                            </>
                        }
                        {...register("showContact")}
                    />
                </Section>

                {serverError && (
                    <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
                        {getErrorMessage(mutation.error)}
                    </p>
                )}
                {Object.keys(errors).length > 0 && (
                    <p className="text-sm text-red-600" role="alert">
                        יש שדות שצריך לתקן. הם מסומנים באדום.
                    </p>
                )}

                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                    <Link to={isEdit ? `/recipes/${editId}` : "/my-recipes"} className={buttonClass("secondary", "lg")}>
                        ביטול
                    </Link>
                    <Button type="submit" size="lg" loading={mutation.isPending} disabled={isEdit && !isDirty}>
                        {isEdit ? "שמירת השינויים" : "פרסום המתכון"}
                    </Button>
                </div>
            </form>
        </div>
    );
}
