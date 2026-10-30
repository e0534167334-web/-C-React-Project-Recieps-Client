import { Link } from "react-router-dom";
import { buttonClass } from "../lib/ui";

export function NotFoundPage() {
    return (
        <div className="flex flex-col items-center py-20 text-center">
            <p className="text-7xl" aria-hidden>
                🥘
            </p>
            <p className="mt-6 text-sm font-semibold tracking-widest text-brand-500">404</p>
            <h1 className="mt-2 text-3xl font-bold text-stone-900">העמוד לא נמצא</h1>
            <p className="mt-2 max-w-sm text-stone-500">נראה שהמתכון לעמוד הזה עוד לא נכתב. אולי הקישור שגוי?</p>
            <Link to="/" className={buttonClass("primary", "lg", "mt-8")}>
                חזרה לדף הבית
            </Link>
        </div>
    );
}
