import axios from "axios";
import type { ApiError } from "../types/api-types";

export const TOKEN_KEY = "token";

// מופע אחד של axios לכל האתר. כתובת השרת מגיעה רק מ־VITE_API_URL
export const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:3000",
});

// לפני כל בקשה: מצרפים Token אם יש
api.interceptors.request.use((config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// אחרי כל תשובה: 401 בבקשה שנשלחה עם Token = ההתחברות פגה
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const url: string = error.config?.url ?? "";
        const isAuthForm = url.includes("/api/auth/login") || url.includes("/api/auth/register");
        const hadToken = Boolean(error.config?.headers?.Authorization);
        if (error.response?.status === 401 && hadToken && !isAuthForm) {
            localStorage.removeItem(TOKEN_KEY);
            // AuthContext מאזין לאירוע הזה, מנתק ומעביר להתחברות
            window.dispatchEvent(new Event("auth:expired"));
        }
        return Promise.reject(error);
    }
);

const STATUS_MESSAGES: Record<number, string> = {
    403: "אין לך הרשאה לפעולה הזו",
    404: "לא נמצא",
    413: "התמונה גדולה מדי",
    415: "אפשר להעלות JPG, PNG או WEBP",
    429: "יותר מדי ניסיונות. נסו שוב בעוד כמה דקות",
    503: "השירות לא זמין כרגע",
};

/** הודעת שגיאה בעברית מתוך כל שגיאה שחזרה מהשרת */
export function getErrorMessage(error: unknown): string {
    if (axios.isAxiosError<ApiError>(error)) {
        if (!error.response) return "אין חיבור לשרת. בדקו את החיבור ונסו שוב";
        const message = error.response.data?.error?.message;
        if (message) return message;
        return STATUS_MESSAGES[error.response.status] ?? "משהו השתבש. נסו שוב";
    }
    return "משהו השתבש. נסו שוב";
}

/** קוד הסטטוס של שגיאה מהשרת, אם יש */
export function getErrorStatus(error: unknown): number | undefined {
    return axios.isAxiosError(error) ? error.response?.status : undefined;
}

/** שגיאות ולידציה לפי שדה (400), להצגה ליד השדה הנכון בטופס */
export function getFieldErrors(error: unknown): { field: string; message: string }[] {
    if (axios.isAxiosError<ApiError>(error)) {
        return error.response?.data?.error?.details ?? [];
    }
    return [];
}
