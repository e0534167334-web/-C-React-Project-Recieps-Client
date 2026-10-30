import { createContext } from "react";
import type { AuthResponse, User } from "../types/api-types";

export interface AuthContextValue {
    user: User | null;
    token: string | null;
    /** true בזמן שבודקים מול /api/auth/me אם ה־Token השמור עדיין בתוקף */
    isLoading: boolean;
    isAdmin: boolean;
    login: (auth: AuthResponse) => void;
    logout: () => void;
    /** עדכון פרטי המשתמשת אחרי עריכת פרופיל */
    setUser: (user: User) => void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
