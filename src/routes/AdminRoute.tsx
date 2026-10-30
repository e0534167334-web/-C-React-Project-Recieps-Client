import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { PageLoader } from "../components/ui/States";

/** עמודי מנהל. מי שלא מחוברת מועברת להתחברות, ומי שאינה ADMIN לדף הבית */
export function AdminRoute() {
    const { user, isAdmin, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) return <PageLoader />;
    if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
    if (!isAdmin) return <Navigate to="/" replace />;
    return <Outlet />;
}
