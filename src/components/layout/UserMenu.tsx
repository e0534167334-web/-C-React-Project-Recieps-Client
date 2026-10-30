import { useCallback, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BookHeart, ChevronDown, LogOut, NotebookPen, ShieldCheck, Tags, UserRound } from "lucide-react";
import { useAuth } from "../../context/useAuth";
import { useToast } from "../../context/useToast";
import { useClickOutside } from "../../hooks/useClickOutside";

export function UserMenu() {
    const { user, isAdmin, logout } = useAuth();
    const toast = useToast();
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const close = useCallback(() => setOpen(false), []);
    useClickOutside(ref, close, open);

    if (!user) return null;

    const onLogout = () => {
        setOpen(false);
        logout();
        toast("התנתקת בהצלחה. להתראות!", "info");
        navigate("/");
    };

    const item = "flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-stone-700 transition hover:bg-stone-100";

    return (
        <div ref={ref} className="relative">
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="flex items-center gap-2 rounded-xl py-1 ps-1 pe-2 transition hover:bg-stone-100"
                aria-expanded={open}
            >
                <span className="flex size-8 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-sm font-semibold text-white">
                    {user.displayName.charAt(0)}
                </span>
                <span className="hidden max-w-28 truncate text-sm font-medium text-stone-700 sm:block">
                    {user.displayName}
                </span>
                <ChevronDown className="hidden size-4 text-stone-400 sm:block" />
            </button>

            {open && (
                <div className="absolute end-0 top-12 z-40 w-60 animate-slide-up rounded-2xl border border-stone-200 bg-white p-2 shadow-card-hover">
                    <div className="border-b border-stone-100 px-3 pt-1 pb-3">
                        <p className="truncate font-medium text-stone-900">{user.displayName}</p>
                        <p className="truncate text-xs text-stone-500">{user.email}</p>
                        {isAdmin && <p className="mt-1 text-xs font-medium text-brand-600">מנהל/ת האתר</p>}
                    </div>
                    <nav className="flex flex-col py-1" onClick={close}>
                        <Link to="/profile" className={item}>
                            <UserRound className="size-4 text-stone-400" /> הפרופיל שלי
                        </Link>
                        <Link to="/my-recipes" className={item}>
                            <NotebookPen className="size-4 text-stone-400" /> המתכונים שלי
                        </Link>
                        <Link to="/cookbook" className={item}>
                            <BookHeart className="size-4 text-stone-400" /> הספר שלי
                        </Link>
                        {isAdmin && (
                            <>
                                <Link to="/admin/pending" className={item}>
                                    <ShieldCheck className="size-4 text-stone-400" /> תור אישורים
                                </Link>
                                <Link to="/admin/categories" className={item}>
                                    <Tags className="size-4 text-stone-400" /> ניהול קטגוריות
                                </Link>
                            </>
                        )}
                    </nav>
                    <div className="border-t border-stone-100 pt-1">
                        <button type="button" onClick={onLogout} className={`${item} w-full text-red-600 hover:bg-red-50`}>
                            <LogOut className="size-4" /> יציאה
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
