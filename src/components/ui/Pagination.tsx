import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./Button";

interface PaginationProps {
    page: number;
    totalPages: number;
    onChange: (page: number) => void;
}

export function Pagination({ page, totalPages, onChange }: PaginationProps) {
    if (totalPages <= 1) return null;

    const go = (target: number) => {
        onChange(target);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <nav className="flex items-center justify-center gap-3 pt-8" aria-label="מעבר בין עמודים">
            <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => go(page - 1)}>
                <ChevronRight className="size-4" />
                הקודם
            </Button>
            <span className="text-sm text-stone-500">
                עמוד <span className="font-semibold text-stone-800">{page}</span> מתוך {totalPages}
            </span>
            <Button variant="secondary" size="sm" disabled={page >= totalPages} onClick={() => go(page + 1)}>
                הבא
                <ChevronLeft className="size-4" />
            </Button>
        </nav>
    );
}
