import { useCallback, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, UtensilsCrossed, X } from "lucide-react";
import { getRecipes } from "../../api/recipes";
import { useClickOutside } from "../../hooks/useClickOutside";
import { useDebounce } from "../../hooks/useDebounce";
import { inputClass } from "../../lib/ui";
import { Spinner } from "../ui/States";

export interface PickedRecipe {
    id: number;
    title: string;
}

interface RecipePickerProps {
    id: string;
    value: PickedRecipe | null;
    onChange: (recipe: PickedRecipe | null) => void;
}

/** בחירת מתכון קשור: מקלידים שם ובוחרים מהתוצאות */
export function RecipePicker({ id, value, onChange }: RecipePickerProps) {
    const [text, setText] = useState("");
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const search = useDebounce(text.trim(), 350);
    const close = useCallback(() => setOpen(false), []);
    useClickOutside(ref, close, open);

    const results = useQuery({
        queryKey: ["recipes", "picker", search],
        queryFn: () => getRecipes({ search, pageSize: 6 }),
        enabled: open && search.length >= 2,
    });

    if (value) {
        return (
            <div className="flex items-center gap-2 rounded-xl border border-brand-200 bg-brand-50 px-3.5 py-2.5 text-sm">
                <UtensilsCrossed className="size-4 text-brand-600" />
                <span className="flex-1 font-medium text-brand-800">{value.title}</span>
                <button
                    type="button"
                    onClick={() => onChange(null)}
                    className="rounded-md p-1 text-brand-600 hover:bg-brand-100"
                    aria-label="הסרת המתכון הקשור"
                >
                    <X className="size-4" />
                </button>
            </div>
        );
    }

    return (
        <div ref={ref} className="relative">
            <Search className="pointer-events-none absolute top-1/2 start-3.5 size-4 -translate-y-1/2 text-stone-400" />
            <input
                id={id}
                value={text}
                onChange={(e) => {
                    setText(e.target.value);
                    setOpen(true);
                }}
                onFocus={() => setOpen(true)}
                placeholder="הקלידו שם של מתכון מהאתר..."
                className={`${inputClass} w-full ps-10`}
                autoComplete="off"
            />
            {open && search.length >= 2 && (
                <div className="absolute inset-x-0 top-full z-20 mt-1 overflow-hidden rounded-xl border border-stone-200 bg-white shadow-card-hover">
                    {results.isPending ? (
                        <div className="flex justify-center py-4">
                            <Spinner className="size-5" />
                        </div>
                    ) : results.data?.items.length ? (
                        <ul>
                            {results.data.items.map((r) => (
                                <li key={r.id}>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            onChange({ id: r.id, title: r.title });
                                            setText("");
                                            setOpen(false);
                                        }}
                                        className="flex w-full items-center justify-between gap-2 px-4 py-2.5 text-start text-sm hover:bg-stone-50"
                                    >
                                        <span className="font-medium text-stone-800">{r.title}</span>
                                        <span className="text-xs text-stone-400">{r.category.name}</span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="px-4 py-3 text-sm text-stone-500">לא נמצאו מתכונים</p>
                    )}
                </div>
            )}
        </div>
    );
}
