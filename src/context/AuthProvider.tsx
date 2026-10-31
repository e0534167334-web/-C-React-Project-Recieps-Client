import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { TOKEN_KEY } from "../api/api";
import { getMe } from "../api/auth";
import type { AuthResponse, User } from "../types/api-types";
import { AuthContext } from "./auth-context";

export function AuthProvider({ children }: { children: ReactNode }) {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));

    const meQuery = useQuery({
        queryKey: ["me"],
        queryFn: getMe,
        enabled: token !== null,
        staleTime: 5 * 60 * 1000,
    });

    const login = useCallback(
        (auth: AuthResponse) => {
            localStorage.setItem(TOKEN_KEY, auth.token);
            setToken(auth.token);
            queryClient.setQueryData(["me"], auth.user);
            queryClient.invalidateQueries({ predicate: (q) => q.queryKey[0] !== "me" });
        },
        [queryClient]
    );

    const logout = useCallback(() => {
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
        queryClient.removeQueries({ queryKey: ["me"] });
        queryClient.resetQueries();
    }, [queryClient]);

    const setUser = useCallback(
        (user: User) => queryClient.setQueryData(["me"], user),
        [queryClient]
    );

    useEffect(() => {
        const onExpired = () => {
            logout();
            navigate("/login", { state: { expired: true } });
        };
        window.addEventListener("auth:expired", onExpired);
        return () => window.removeEventListener("auth:expired", onExpired);
    }, [logout, navigate]);

    const user = token ? (meQuery.data ?? null) : null;

    const value = useMemo(
        () => ({
            user,
            token,
            isLoading: token !== null && meQuery.isPending,
            isAdmin: user?.role === "ADMIN",
            login,
            logout,
            setUser,
        }),
        [user, token, meQuery.isPending, login, logout, setUser]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
