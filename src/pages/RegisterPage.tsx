import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import { registerRequest } from "../api/auth";
import { getErrorMessage, getErrorStatus, getFieldErrors } from "../api/api";
import { useAuth } from "../context/useAuth";
import { useToast } from "../context/useToast";
import { AuthCard } from "../components/layout/AuthCard";
import { Button } from "../components/ui/Button";
import { Field, Input } from "../components/ui/Field";

const registerSchema = z.object({
    displayName: z.string().trim().min(2, "שם התצוגה חייב להכיל 2 תווים לפחות").max(40, "עד 40 תווים"),
    email: z.string().trim().min(1, "יש להזין אימייל").email("אימייל לא תקין"),
    password: z
        .string()
        .min(8, "הסיסמה חייבת להכיל 8 תווים לפחות")
        .regex(/[A-Za-z֐-׿]/, "הסיסמה חייבת להכיל אות")
        .regex(/\d/, "הסיסמה חייבת להכיל ספרה"),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export function RegisterPage() {
    const { user, login } = useAuth();
    const toast = useToast();
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        setError,
        formState: { errors },
    } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
        defaultValues: { displayName: "", email: "", password: "" },
    });

    const mutation = useMutation({
        mutationFn: registerRequest,
        onSuccess: (data) => {
            login(data);
            toast(`${data.user.displayName}, ברוכים הבאים! החשבון נוצר בהצלחה 🎉`);
            navigate("/", { replace: true });
        },
        onError: (error) => {
            if (getErrorStatus(error) === 409) {
                setError("email", { message: getErrorMessage(error) });
            }
            for (const { field, message } of getFieldErrors(error)) {
                if (field === "displayName" || field === "email" || field === "password") {
                    setError(field, { message });
                }
            }
        },
    });

    if (user) return <Navigate to="/" replace />;

    const generalError =
        mutation.error && getErrorStatus(mutation.error) !== 409 && getFieldErrors(mutation.error).length === 0;

    return (
        <AuthCard
            emoji="🧑‍🍳"
            title="הצטרפות לקהילה"
            subtitle="יוצרים חשבון ומתחילים לשמור את המתכונים שלכם"
            footer={
                <>
                    כבר יש לך חשבון?{" "}
                    <Link to="/login" className="font-medium text-brand-600 hover:text-brand-700">
                        להתחברות
                    </Link>
                </>
            }
        >
            {generalError && (
                <div className="mb-5 flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
                    <AlertCircle className="size-4 shrink-0" />
                    {getErrorMessage(mutation.error)}
                </div>
            )}

            <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-4" noValidate>
                <Field label="שם תצוגה" htmlFor="displayName" error={errors.displayName?.message} hint="כך יופיע שמך ליד המתכונים שלך">
                    <Input
                        id="displayName"
                        autoComplete="nickname"
                        placeholder="למשל: נועה"
                        aria-invalid={!!errors.displayName}
                        {...register("displayName")}
                    />
                </Field>
                <Field label="אימייל" htmlFor="email" error={errors.email?.message}>
                    <Input
                        id="email"
                        type="email"
                        autoComplete="email"
                        dir="ltr"
                        placeholder="name@example.com"
                        aria-invalid={!!errors.email}
                        {...register("email")}
                    />
                </Field>
                <Field
                    label="סיסמה"
                    htmlFor="password"
                    error={errors.password?.message}
                    hint="8 תווים לפחות, עם אות וספרה"
                >
                    <Input
                        id="password"
                        type="password"
                        autoComplete="new-password"
                        dir="ltr"
                        aria-invalid={!!errors.password}
                        {...register("password")}
                    />
                </Field>
                <Button type="submit" size="lg" className="w-full" loading={mutation.isPending}>
                    יצירת חשבון
                </Button>
            </form>
        </AuthCard>
    );
}
