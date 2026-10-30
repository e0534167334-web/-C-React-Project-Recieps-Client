import { useQuery } from "@tanstack/react-query";
import { getCategories } from "../api/recipes";

/** הקטגוריות כמעט לא משתנות, ולכן נשמרות בזיכרון לזמן ארוך */
export function useCategories() {
    return useQuery({
        queryKey: ["categories"],
        queryFn: getCategories,
        staleTime: 10 * 60 * 1000,
    });
}
