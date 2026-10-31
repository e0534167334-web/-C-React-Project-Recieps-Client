import { useCallback } from "react";
import { useSearchParams } from "react-router-dom";

export function useParamState() {
    const [params, setParams] = useSearchParams();

    const get = useCallback((key: string) => params.get(key) ?? "", [params]);

    const set = useCallback(
        (updates: Record<string, string | undefined>) => {
            setParams(
                (current) => {
                    const next = new URLSearchParams(current);
                    for (const [key, value] of Object.entries(updates)) {
                        if (value) next.set(key, value);
                        else next.delete(key);
                    }
                    if (!("page" in updates)) next.delete("page");
                    return next;
                },
                { replace: true }
            );
        },
        [setParams]
    );

    const clear = useCallback((keep: string[] = []) => {
        setParams(
            (current) => {
                const next = new URLSearchParams();
                for (const key of keep) {
                    const value = current.get(key);
                    if (value) next.set(key, value);
                }
                return next;
            },
            { replace: true }
        );
    }, [setParams]);

    return { params, get, set, clear };
}
