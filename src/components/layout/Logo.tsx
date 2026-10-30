import { Link } from "react-router-dom";
import { CookingPot } from "lucide-react";
import { APP_NAME } from "../../lib/config";

export function Logo() {
    return (
        <Link to="/" className="flex items-center gap-2 rounded-lg">
            <span className="flex size-9 items-center justify-center rounded-xl bg-brand-500 text-white shadow-sm">
                <CookingPot className="size-5" />
            </span>
            <span className="text-lg font-bold tracking-tight text-stone-900">{APP_NAME}</span>
        </Link>
    );
}
