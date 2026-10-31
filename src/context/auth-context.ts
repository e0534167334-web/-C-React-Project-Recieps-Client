import { createContext } from "react";
import type { AuthResponse, User } from "../types/api-types";

export interface AuthContextValue {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    isAdmin: boolean;
    login: (auth: AuthResponse) => void;
    logout: () => void;
    setUser: (user: User) => void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
