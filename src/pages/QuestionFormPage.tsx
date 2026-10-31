import { useEffect } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowRight, Info } from "lucide-react";
import { createQuestion, getQuestion, updateQuestion, type QuestionInput } from "../api/forum";
import { getErrorMessage, getErrorStatus, getFieldErrors } from "../api/api";
import { useToast } from "../context/useToast";
import { useCategories } from "../hooks/useCategories";
import { buttonClass, cardClass } from "../lib/ui";
import type { Question } from "../types/api-types";
import { RecipePicker } from "../components/forum/RecipePicker";
import { Button } from "../components/ui/Button";
import { Checkbox, Field, Input, Select, Textarea } from "../components/ui/Field";
import { EmptyState, ErrorState, PageLoader } from "../components/ui/States";

const questionSchema = z.object({
    title: z.string().trim().min(5, "הכותרת חייבת להכיל 5 תווים לפחות").max(150, "עד 150 תווים"),
    body: z.string().trim().min(10, "פרטו קצת יותר: 10 תווים לפחות").max(5000, "עד 5,000 תווים"),
    categoryId: z.string(),
    recipe: z.object({ id: z.number(), title: z.string() }).nullable(),
    videoUrl: z
        .string()
        .trim()
        .refine((v) => v === "" || /^https:\/\/\S+\.\S+/.test(v), "קישור תקין שמתחיל ב־https://"),
    showContact: z.boolean(),
});

type QuestionFormData = z.infer<typeof questionSchema>;

const EMPTY: QuestionFormData = { title: "", body: "", categoryId: "", recipe: null, videoUrl: "", showContact: false };

function toFormData(q: Question): QuestionFormData {
    return {
        title: q.title,
        body: q.body,
        categoryId: q.category ? String(q.category.id) : "",
        recipe: q.recipe,
        videoUrl: q.videoUrl ?? "",
        showContact: q.showContact,
    };
}

function toInput(data: QuestionFormData): QuestionInput {
    return {
        title: data.title.trim(),
        body: data.body.trim(),
        categoryId: data.categoryId ? Number(data.categoryId) : null,
        recipeId: data.recipe?.id ?? null,
        videoUrl: data.videoUrl.trim() || null,
        showContact: data.showContact,
    };
}

const FIELD_TO_INPUT: Record<keyof QuestionFormData, keyof QuestionInput> = {
    title: "title",
    body: "body",
    categoryId: "categoryId",
    recipe: "recipeId",
    videoUrl: "videoUrl",
    showContact: "showContact",
};

export function QuestionFormPage() {
    const params = useParams();
    const editId = params.id ? Number(params.id) : null;
    const isEdit = editId !== null;
    const navigate = useNavigate();
    const toast = useToast();
    const queryClient = useQueryClient();
    const categories = useCategories();

    const existing = useQuery({
        queryKey: ["forum", "question", editId],
        queryFn: () => getQuestion(editId!),
        enabled: isEdit,
    });

    const {
        register,
        control,
        handleSubmit,
        reset,
        setError,
        formState: { errors, dirtyFields, isDirty },
    } = useForm<QuestionFormData>({
        resolver: zodResolver(questionSchema),
        defaultValues: EMPTY,
    });

    useEffect(() => {
        if (existing.data) reset(toFormData(existing.data));
    }, [existing.data, reset]);

    const mutation = useMutation({
        mutationFn: (data: QuestionFormData) => {
            const input = toInput(data);
            if (!isEdit) return createQuestion(input);
            const changed = Object.fromEntries(
                (Object.keys(dirtyFields) as (keyof QuestionFormData)[]).map((key) => {
                    const inputKey = FIELD_TO_INPUT[key];
                    return [inputKey, input[inputKey]];
                })
            ) as Partial<QuestionInput>;
            return updateQuestion(editId, changed);
        },
        onSuccess: (question) => {
            queryClient.invalidateQueries({ queryKey: ["forum"] });
            toast(
                question.status === "PENDING"
                    ? "השאלה נשמרה ותפורסם אחרי אישור מנהל"
                    : isEdit
                      ? "השאלה עודכנה"
                      : "השאלה פורסמה. הקהילה כבר בדרך לעזור 🙌"
            );
            navigate(`/forum?open=${question.id}`);
        },
        onError: (error) => {
            for (const { field, message } of getFieldErrors(error)) {
                if (field === "title" || field === "body" || field === "videoUrl") setError(field, { message });
            }
        },
    });

    const hasVideo = !!useWatch({ control, name: "videoUrl" })?.trim();

    if (isEdit && existing.isPending) return <PageLoader />;
    if (isEdit && getErrorStatus(existing.error) === 404) {
        return <EmptyState emoji="💬" title="השאלה לא נמצאה" action={<Link to="/forum" className={buttonClass("primary")}>לפורום</Link>} />;
    }
    if (isEdit && existing.isError) {
        return <ErrorState message={getErrorMessage(existing.error)} onRetry={() => existing.refetch()} />;
    }
    if (isEdit && existing.data && !existing.data.permissions.canEdit) {
        return <EmptyState emoji="🔒" title="אין לך הרשאה לערוך את השאלה הזו" action={<Link to="/forum" className={buttonClass("secondary")}>לפורום</Link>} />;
    }

    return (
        <div className="mx-auto max-w-2xl animate-fade-in space-y-6">
            <div>
                <Link to="/forum" className="inline-flex items-center gap-1 text-sm font-medium text-stone-500 hover:text-stone-800">
                    <ArrowRight className="size-4" /> לפורום
                </Link>
                <h1 className="mt-3 text-3xl font-bold tracking-tight text-stone-900">{isEdit ? "עריכת שאלה" : "שאלה חדשה"}</h1>
                <p className="mt-1 text-stone-500">ככל שתפרטו יותר, כך יהיה קל יותר לעזור</p>
            </div>

            <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className={`${cardClass} space-y-5 p-6 sm:p-7`} noValidate>
                <Field label="כותרת" htmlFor="title" error={errors.title?.message} required>
                    <Input id="title" placeholder="למשל: למה העוגה שוקעת באמצע?" aria-invalid={!!errors.title} {...register("title")} />
                </Field>
                <Field label="פירוט השאלה" htmlFor="body" error={errors.body?.message} required>
                    <Textarea id="body" rows={6} placeholder="מה הכנתם, מה קרה, ומה כבר ניסיתם?" aria-invalid={!!errors.body} {...register("body")} />
                </Field>
                <div className="grid gap-5 sm:grid-cols-2">
                    <Field label="קטגוריה" htmlFor="categoryId">
                        <Select id="categoryId" {...register("categoryId")}>
                            <option value="">ללא קטגוריה</option>
                            {categories.data?.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                </option>
                            ))}
                        </Select>
                    </Field>
                    <Field label="מתכון קשור" htmlFor="recipe" hint="רשות">
                        <Controller
                            control={control}
                            name="recipe"
                            render={({ field }) => <RecipePicker id="recipe" value={field.value} onChange={field.onChange} />}
                        />
                    </Field>
                </div>
                <Field label="קישור לסרטון" htmlFor="videoUrl" error={errors.videoUrl?.message} hint="רשות">
                    <Input id="videoUrl" type="url" dir="ltr" placeholder="https://..." aria-invalid={!!errors.videoUrl} {...register("videoUrl")} />
                </Field>
                {hasVideo && (
                    <div className="flex gap-3 rounded-2xl bg-sky-50 px-4 py-3 text-sm text-sky-900">
                        <Info className="mt-0.5 size-4 shrink-0" />
                        <p>שאלה עם סרטון תפורסם לאחר אישור מנהל.</p>
                    </div>
                )}
                <Checkbox
                    id="showContact"
                    label="הצגת פרטי הקשר שלי"
                    description="פרטי הקשר מהפרופיל יוצגו ליד השאלה לכל מבקרי האתר"
                    {...register("showContact")}
                />

                {mutation.error && getFieldErrors(mutation.error).length === 0 && (
                    <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
                        {getErrorMessage(mutation.error)}
                    </p>
                )}

                <div className="flex flex-col-reverse gap-3 border-t border-stone-100 pt-5 sm:flex-row sm:justify-end">
                    <Link to="/forum" className={buttonClass("secondary", "lg")}>
                        ביטול
                    </Link>
                    <Button type="submit" size="lg" loading={mutation.isPending} disabled={isEdit && !isDirty}>
                        {isEdit ? "שמירת השינויים" : "פרסום השאלה"}
                    </Button>
                </div>
            </form>
        </div>
    );
}
