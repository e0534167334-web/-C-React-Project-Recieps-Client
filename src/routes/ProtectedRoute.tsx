import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { PageLoader } from "../components/ui/States";

/** עמודים למחוברות בלבד. מי שלא מחוברת מועברת ל־/login, ואחרי ההתחברות חוזרת לכאן */
export function ProtectedRoute() {
    const { user, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) return <PageLoader />;
    if (!user) return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
    return <Outlet />;
}
