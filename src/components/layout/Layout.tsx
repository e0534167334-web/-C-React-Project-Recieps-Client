import { Suspense, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { APP_NAME } from "../../lib/config";
import { AssistantWidget } from "../assistant/AssistantWidget";
import { PageLoader } from "../ui/States";
import { ErrorBoundary } from "./ErrorBoundary";
import { Header } from "./Header";

export function Layout() {
    const { pathname } = useLocation();

    // כל מעבר עמוד מתחיל מלמעלה
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    return (
        <div className="flex min-h-svh flex-col">
            <Header />
            <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:py-10">
                <ErrorBoundary resetKey={pathname}>
                    <Suspense fallback={<PageLoader />}>
                        <Outlet />
                    </Suspense>
                </ErrorBoundary>
            </main>
            <footer className="border-t border-stone-200/70 bg-white/60">
                <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-6 text-sm text-stone-500 sm:flex-row">
                    <p>
                        <span className="font-semibold text-stone-700">{APP_NAME}</span> · שומרים מתכונים, משתפים, ומבשלים יחד
                    </p>
                    <p>נבנה באהבה 🧡</p>
                </div>
            </footer>
            <AssistantWidget />
        </div>
    );
}
