import { useContext } from "react";
import { ToastContext } from "./toast-context";

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error("useToast חייב להיות בתוך ToastProvider");
    }
    return context.showToast;
}
