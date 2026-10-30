import { useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Menu, Plus, X } from "lucide-react";
import { getForumStats } from "../../api/forum";
import { useAuth } from "../../context/useAuth";
import { buttonClass } from "../../lib/ui";
import { Logo } from "./Logo";
import { NotificationBell } from "./NotificationBell";
import { UserMenu } from "./UserMenu";

interface NavItem {
    to: string;
    label: string;
    badge?: number;
}

export function Header() {
    const { user, isAdmin, isLoading } = useAuth();
    const location = useLocation();
    // התפריט בנייד פתוח רק בעמוד שבו פתחו אותו, ולכן נסגר לבד במעבר עמוד
    const [openOnPage, setOpenOnPage] = useState<string | null>(null);
    const mobileOpen = openOnPage === location.key;
    const setMobileOpen = (toggle: (open: boolean) => boolean) =>
        setOpenOnPage(toggle(mobileOpen) ? location.key : null);

    // מספר השאלות שממתינות לתשובה, ליד "פורום עזרה"
    const statsQuery = useQuery({
        queryKey: ["forum", "stats"],
        queryFn: getForumStats,
        refetchInterval: 3 * 60_000,
    });
    const unanswered = statsQuery.data?.unansweredCount ?? 0;

    const items: NavItem[] = [
        { to: "/", label: "מתכונים" },
        { to: "/forum", label: "פורום עזרה", badge: unanswered },
    ];
    if (user) {
        items.push({ to: "/my-recipes", label: "המתכונים שלי" }, { to: "/cookbook", label: "הספר שלי" });
    }
    if (isAdmin) {
        items.push({ to: "/admin/pending", label: "תור אישורים" });
    }

    const linkClass = ({ isActive }: { isActive: boolean }) =>
        `relative flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition ${
            isActive ? "bg-brand-50 text-brand-700" : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
        }`;

    const renderLinks = () =>
        items.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.to === "/"} className={linkClass}>
                {item.label}
                {item.badge ? (
                    <span
                        className="flex min-w-5 items-center justify-center rounded-full bg-brand-500 px-1.5 text-[11px] font-bold leading-5 text-white"
                        title="שאלות שממתינות לתשובה"
                    >
                        {item.badge}
                    </span>
                ) : null}
            </NavLink>
        ));

    return (
        <header className="sticky top-0 z-30 border-b border-stone-200/70 bg-white/80 backdrop-blur-lg">
            <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4">
                <Logo />

                <nav className="ms-4 hidden items-center gap-1 lg:flex">{renderLinks()}</nav>

                <div className="ms-auto flex items-center gap-1.5">
                    {isLoading ? null : user ? (
                        <>
                            <Link to="/recipes/new" className={buttonClass("primary", "md", "hidden sm:inline-flex")}>
                                <Plus className="size-4" />
                                מתכון חדש
                            </Link>
                            <NotificationBell />
                            <UserMenu />
                        </>
                    ) : (
                        <>
                            <Link to="/login" className={buttonClass("ghost", "md", "hidden sm:inline-flex")}>
                                התחברות
                            </Link>
                            <Link to="/register" className={buttonClass("primary")}>
                                הרשמה
                            </Link>
                        </>
                    )}
                    <button
                        type="button"
                        onClick={() => setMobileOpen((v) => !v)}
                        className="flex size-10 items-center justify-center rounded-xl text-stone-600 hover:bg-stone-100 lg:hidden"
                        aria-label="תפריט"
                        aria-expanded={mobileOpen}
                    >
                        {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
                    </button>
                </div>
            </div>

            {mobileOpen && (
                <nav className="animate-fade-in border-t border-stone-100 bg-white px-4 py-3 lg:hidden">
                    <div className="flex flex-col gap-1">
                        {renderLinks()}
                        {user ? (
                            <Link to="/recipes/new" className={buttonClass("primary", "md", "mt-2 sm:hidden")}>
                                <Plus className="size-4" />
                                מתכון חדש
                            </Link>
                        ) : (
                            <Link to="/login" className={buttonClass("secondary", "md", "mt-2 sm:hidden")}>
                                התחברות
                            </Link>
                        )}
                    </div>
                </nav>
            )}
        </header>
    );
}
