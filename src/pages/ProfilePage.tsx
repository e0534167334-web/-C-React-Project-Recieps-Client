import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Eye } from "lucide-react";
import { updateProfile } from "../api/auth";
import { getErrorMessage, getFieldErrors } from "../api/api";
import { useAuth } from "../context/useAuth";
import { useToast } from "../context/useToast";
import { cardClass } from "../lib/ui";
import { Button } from "../components/ui/Button";
import { Field, Input } from "../components/ui/Field";
import { PageHeader } from "../components/ui/PageHeader";

const profileSchema = z.object({
    displayName: z.string().trim().min(2, "שם התצוגה חייב להכיל 2 תווים לפחות").max(40, "עד 40 תווים"),
    contactEmail: z
        .string()
        .trim()
        .refine((v) => v === "" || z.email().safeParse(v).success, "אימייל לא תקין"),
    contactPhone: z
        .string()
        .trim()
        .refine((v) => v === "" || /^[\d\s+-]{7,20}$/.test(v), "7–20 תווים: ספרות, רווחים, - ו־+"),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export function ProfilePage() {
    const { user, setUser } = useAuth();
    const toast = useToast();

    const {
        register,
        handleSubmit,
        reset,
        setError,
        formState: { errors, isDirty },
    } = useForm<ProfileFormData>({
        resolver: zodResolver(profileSchema),
        defaultValues: { displayName: "", contactEmail: "", contactPhone: "" },
    });

    useEffect(() => {
        if (user) {
            reset({
                displayName: user.displayName,
                contactEmail: user.contactEmail ?? "",
                contactPhone: user.contactPhone ?? "",
            });
        }
    }, [user, reset]);

    const mutation = useMutation({
        mutationFn: (data: ProfileFormData) =>
            updateProfile({
                displayName: data.displayName.trim(),
                contactEmail: data.contactEmail.trim() || null,
                contactPhone: data.contactPhone.trim() || null,
            }),
        onSuccess: (updated) => {
            setUser(updated);
            toast("הפרופיל עודכן");
        },
        onError: (error) => {
            const fields = getFieldErrors(error);
            for (const { field, message } of fields) {
                if (field === "displayName" || field === "contactEmail" || field === "contactPhone") setError(field, { message });
            }
            if (fields.length === 0) toast(getErrorMessage(error), "error");
        },
    });

    if (!user) return null;

    return (
        <div className="mx-auto max-w-2xl animate-fade-in space-y-6">
            <PageHeader title="הפרופיל שלי" description={`מחובר/ת כ־${user.email}`} />

            <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className={`${cardClass} space-y-5 p-6 sm:p-7`} noValidate>
                <div className="flex items-center gap-4 border-b border-stone-100 pb-5">
                    <span className="flex size-14 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-xl font-semibold text-white">
                        {user.displayName.charAt(0)}
                    </span>
                    <div>
                        <p className="font-semibold text-stone-900">{user.displayName}</p>
                        <p className="text-sm text-stone-500">{user.role === "ADMIN" ? "מנהל/ת האתר" : "חבר/ת קהילה"}</p>
                    </div>
                </div>

                <Field label="שם תצוגה" htmlFor="displayName" error={errors.displayName?.message} required>
                    <Input id="displayName" aria-invalid={!!errors.displayName} {...register("displayName")} />
                </Field>

                <div className="space-y-4 rounded-2xl bg-stone-50 p-5">
                    <div>
                        <h2 className="font-semibold text-stone-900">פרטי קשר</h2>
                        <p className="mt-1 flex items-start gap-2 text-sm text-stone-500">
                            <Eye className="mt-0.5 size-4 shrink-0" />
                            פרטי הקשר גלויים לכל מבקרי האתר, ליד תוכן שבו סימנת "הצגת פרטי הקשר שלי".
                        </p>
                    </div>
                    <Field label="אימייל ליצירת קשר" htmlFor="contactEmail" error={errors.contactEmail?.message} hint="אפשר להשאיר ריק">
                        <Input id="contactEmail" type="email" dir="ltr" placeholder="name@example.com" aria-invalid={!!errors.contactEmail} {...register("contactEmail")} />
                    </Field>
                    <Field label="טלפון" htmlFor="contactPhone" error={errors.contactPhone?.message} hint="אפשר להשאיר ריק">
                        <Input id="contactPhone" type="tel" dir="ltr" placeholder="050-1234567" aria-invalid={!!errors.contactPhone} {...register("contactPhone")} />
                    </Field>
                </div>

                <div className="flex justify-end">
                    <Button type="submit" size="lg" loading={mutation.isPending} disabled={!isDirty}>
                        שמירה
                    </Button>
                </div>
            </form>
        </div>
    );
}
