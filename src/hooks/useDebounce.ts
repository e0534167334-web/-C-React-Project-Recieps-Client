import { useEffect, useState } from "react";

/** מחזיר את הערך רק אחרי שהוא הפסיק להשתנות למשך delay מילישניות */
export function useDebounce<T>(value: T, delay = 500): T {
    const [debounced, setDebounced] = useState(value);

    useEffect(() => {
        const timer = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(timer);
    }, [value, delay]);

    return debounced;
}
