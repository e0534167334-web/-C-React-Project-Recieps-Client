import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";
import { useDebounce } from "../../hooks/useDebounce";
import { inputClass } from "../../lib/ui";

interface SearchInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
    className?: string;
    large?: boolean;
}

/** שדה חיפוש ששולח את הערך חצי שנייה אחרי שמפסיקים להקליד */
export function SearchInput({ value, onChange, placeholder, className = "", large }: SearchInputProps) {
    const [text, setText] = useState(value);
    const [prevValue, setPrevValue] = useState(value);
    const debounced = useDebounce(text, 450);

    // ערך חיצוני חדש (למשל "ניקוי סינונים") מעדכן את השדה
    if (value !== prevValue) {
        setPrevValue(value);
        setText(value);
    }

    // רץ רק כשהטקסט המושהה משתנה, ולא כשהערך החיצוני משתנה
    useEffect(() => {
        if (debounced.trim() !== value) onChange(debounced.trim());
    }, [debounced]); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <div className={`relative ${className}`}>
            <Search
                className={`pointer-events-none absolute top-1/2 start-3.5 -translate-y-1/2 text-stone-400 ${large ? "size-5" : "size-4"}`}
            />
            <input
                type="search"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={placeholder}
                aria-label={placeholder}
                className={`${inputClass} w-full ${large ? "h-14 ps-11 pe-10 text-base" : "ps-10 pe-9"} [&::-webkit-search-cancel-button]:hidden`}
            />
            {text && (
                <button
                    type="button"
                    onClick={() => {
                        setText("");
                        onChange("");
                    }}
                    className="absolute top-1/2 end-3 -translate-y-1/2 rounded-md p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-600"
                    aria-label="ניקוי החיפוש"
                >
                    <X className="size-4" />
                </button>
            )}
        </div>
    );
}
