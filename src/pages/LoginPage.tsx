import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import { loginRequest } from "../api/auth";
import { getErrorMessage } from "../api/api";
import { useAuth } from "../context/useAuth";
import { useToast } from "../context/useToast";
import { AuthCard } from "../components/layout/AuthCard";
import { Button } from "../components/ui/Button";
import { Field, Input } from "../components/ui/Field";

const loginSchema = z.object({
    email: z.string().trim().min(1, "יש להזין אימייל").email("אימייל לא תקין"),
    password: z.string().min(1, "יש להזין סיסמה"),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LocationState {
    from?: string;
    expired?: boolean;
}

export function LoginPage() {
    const { user, login } = useAuth();
    const toast = useToast();
    const navigate = useNavigate();
    const location = useLocation();
    const state = (location.state ?? {}) as LocationState;

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: "", password: "" },
    });

    const mutation = useMutation({
        mutationFn: loginRequest,
        onSuccess: (data) => {
            login(data);
            toast(`שלום ${data.user.displayName}, טוב לראות אותך!`);
            navigate(state.from ?? "/", { replace: true });
        },
    });

    if (user) return <Navigate to={state.from ?? "/"} replace />;

    return (
        <AuthCard
            emoji="👋"
            title="ברוכים השבים"
            subtitle="התחברו כדי לשמור מתכונים ולשתף את שלכם"
            footer={
                <>
                    עדיין אין לך חשבון?{" "}
                    <Link to="/register" className="font-medium text-brand-600 hover:text-brand-700">
                        להרשמה
                    </Link>
                </>
            }
        >
            {state.expired && !mutation.error && (
                <div className="mb-5 flex items-center gap-2 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
                    <AlertCircle className="size-4 shrink-0" />
                    תוקף ההתחברות פג. יש להתחבר שוב.
                </div>
            )}
            {mutation.error && (
                <div className="mb-5 flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
                    <AlertCircle className="size-4 shrink-0" />
                    {getErrorMessage(mutation.error)}
                </div>
            )}

            <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-4" noValidate>
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
                <Field label="סיסמה" htmlFor="password" error={errors.password?.message}>
                    <Input
                        id="password"
                        type="password"
                        autoComplete="current-password"
                        dir="ltr"
                        aria-invalid={!!errors.password}
                        {...register("password")}
                    />
                </Field>
                <Button type="submit" size="lg" className="w-full" loading={mutation.isPending}>
                    התחברות
                </Button>
            </form>
        </AuthCard>
    );
}
