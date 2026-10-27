import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";
import { useMutation } from "@tanstack/react-query";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

// מה שהשרת מחזיר על המשתמש (בלי סיסמה!)
interface User {
    id: number;
    displayName: string;
    role: "USER" | "ADMIN";
}

interface LoginResponse {
    token: string;
    user: User;
}

const loginSchema = z.object({
    email: z.string().email("אימייל לא תקין"),
    password: z.string().min(1, "יש להזין סיסמה"),
});

type LoginFormData = z.infer<typeof loginSchema>;

// הבקשה לשרת – השרת בודק אם המשתמש קיים והסיסמה נכונה
const loginRequest = async (data: LoginFormData): Promise<LoginResponse> => {
    const response = await axios.post<LoginResponse>(`${API_URL}/api/auth/login`, data);
    return response.data;
};

export function Login() {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: "", password: "" },
    });

    const { mutate, isPending, error } = useMutation<LoginResponse, Error, LoginFormData>({
        mutationFn: loginRequest,
        onSuccess: (data) => {
            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));
            alert(`שלום ${data.user.displayName}`); // בהמשך: מעבר לדף הבית
        },
    });

    const onSubmit = (data: LoginFormData) => mutate(data);

    // הודעת השגיאה מהשרת (למשל 401 – פרטים שגויים)
    const serverError =
        axios.isAxiosError(error) && error.response?.status === 401
            ? "אימייל או סיסמה שגויים"
            : error?.message;

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <h2>התחברות</h2>

            <input type="email" placeholder="אימייל" {...register("email")} />
            {errors.email && <p style={{ color: "red" }}>{errors.email.message}</p>}

            <input type="password" placeholder="סיסמה" {...register("password")} />
            {errors.password && <p style={{ color: "red" }}>{errors.password.message}</p>}

            <button type="submit" disabled={isPending}>
                {isPending ? "מתחבר..." : "התחברות"}
            </button>

            {serverError && <p style={{ color: "red" }}>{serverError}</p>}
        </form>
    );
}
