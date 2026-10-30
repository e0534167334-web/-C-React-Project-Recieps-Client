import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createAnswer } from "../../api/forum";
import { getErrorMessage } from "../../api/api";
import { useToast } from "../../context/useToast";
import { Button } from "../ui/Button";
import { Checkbox, Input, Textarea } from "../ui/Field";

const answerSchema = z.object({
    body: z.string().trim().min(2, "התשובה חייבת להכיל 2 תווים לפחות").max(5000, "עד 5,000 תווים"),
    videoUrl: z
        .string()
        .trim()
        .refine((v) => v === "" || /^https:\/\/\S+\.\S+/.test(v), "קישור תקין שמתחיל ב־https://"),
    showContact: z.boolean(),
});

type AnswerFormData = z.infer<typeof answerSchema>;

export function AnswerForm({ questionId }: { questionId: number }) {
    const toast = useToast();
    const queryClient = useQueryClient();

    const {
        register,
        control,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<AnswerFormData>({
        resolver: zodResolver(answerSchema),
        defaultValues: { body: "", videoUrl: "", showContact: false },
    });

    const mutation = useMutation({
        mutationFn: (data: AnswerFormData) =>
            createAnswer(questionId, {
                body: data.body.trim(),
                videoUrl: data.videoUrl.trim() || null,
                showContact: data.showContact,
            }),
        onSuccess: (answer) => {
            reset();
            queryClient.invalidateQueries({ queryKey: ["forum"] });
            toast(answer.status === "PENDING" ? "התשובה נשלחה ותפורסם אחרי אישור מנהל" : "התשובה פורסמה. תודה על העזרה! 🙏");
        },
        onError: (error) => toast(getErrorMessage(error), "error"),
    });

    const hasVideo = !!useWatch({ control, name: "videoUrl" })?.trim();

    return (
        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-3" noValidate>
            <label htmlFor={`answer-${questionId}`} className="text-sm font-medium text-stone-700">
                התשובה שלך
            </label>
            <Textarea
                id={`answer-${questionId}`}
                rows={3}
                placeholder="שתפו מניסיונכם..."
                aria-invalid={!!errors.body}
                {...register("body")}
            />
            {errors.body && <p className="text-xs text-red-600">{errors.body.message}</p>}
            <details className="group text-sm">
                <summary className="cursor-pointer text-stone-500 hover:text-stone-700">אפשרויות נוספות</summary>
                <div className="mt-3 space-y-3">
                    <Input dir="ltr" type="url" placeholder="קישור לסרטון (רשות): https://..." aria-invalid={!!errors.videoUrl} {...register("videoUrl")} />
                    {errors.videoUrl && <p className="text-xs text-red-600">{errors.videoUrl.message}</p>}
                    {hasVideo && <p className="text-xs text-sky-700">תשובה עם סרטון תפורסם אחרי אישור מנהל.</p>}
                    <Checkbox id={`answer-contact-${questionId}`} label="הצגת פרטי הקשר שלי" {...register("showContact")} />
                </div>
            </details>
            <div className="flex justify-end">
                <Button type="submit" loading={mutation.isPending}>
                    שליחת תשובה
                </Button>
            </div>
        </form>
    );
}
