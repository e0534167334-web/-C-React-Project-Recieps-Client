import { useState, type FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, Pencil, Plus, Trash2, X } from "lucide-react";
import { createCategory, deleteCategory, renameCategory } from "../api/recipes";
import { getErrorMessage } from "../api/api";
import { useToast } from "../context/useToast";
import { useCategories } from "../hooks/useCategories";
import { categoryEmoji } from "../lib/labels";
import { cardClass } from "../lib/ui";
import type { Category } from "../types/api-types";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Field";
import { ConfirmDialog } from "../components/ui/Modal";
import { PageHeader } from "../components/ui/PageHeader";
import { ErrorState, PageLoader } from "../components/ui/States";

const validName = (name: string) => name.trim().length >= 2 && name.trim().length <= 40;

export function AdminCategoriesPage() {
    const toast = useToast();
    const queryClient = useQueryClient();
    const categories = useCategories();
    const [newName, setNewName] = useState("");
    const [editing, setEditing] = useState<{ id: number; name: string } | null>(null);
    const [toDelete, setToDelete] = useState<Category | null>(null);

    const refresh = () => queryClient.invalidateQueries({ queryKey: ["categories"] });
    const onError = (error: unknown) => toast(getErrorMessage(error), "error");

    const create = useMutation({
        mutationFn: createCategory,
        onSuccess: (c) => {
            refresh();
            setNewName("");
            toast(`הקטגוריה "${c.name}" נוספה`);
        },
        onError,
    });

    const rename = useMutation({
        mutationFn: (v: { id: number; name: string }) => renameCategory(v.id, v.name),
        onSuccess: () => {
            refresh();
            // שם הקטגוריה מופיע גם בכרטיסי המתכונים
            queryClient.invalidateQueries({ queryKey: ["recipes"] });
            setEditing(null);
            toast("שם הקטגוריה עודכן");
        },
        onError,
    });

    const remove = useMutation({
        mutationFn: deleteCategory,
        onSuccess: () => {
            refresh();
            setToDelete(null);
            toast("הקטגוריה נמחקה");
        },
        onError: (error) => {
            setToDelete(null);
            onError(error);
        },
    });

    const onCreate = (e: FormEvent) => {
        e.preventDefault();
        if (validName(newName)) create.mutate(newName.trim());
    };

    const onRename = (e: FormEvent) => {
        e.preventDefault();
        if (editing && validName(editing.name)) rename.mutate({ id: editing.id, name: editing.name.trim() });
    };

    if (categories.isPending) return <PageLoader />;
    if (categories.isError) return <ErrorState message={getErrorMessage(categories.error)} onRetry={() => categories.refetch()} />;

    return (
        <div className="mx-auto max-w-2xl space-y-6">
            <PageHeader title="ניהול קטגוריות" description="קטגוריה שיש בה מתכונים אי אפשר למחוק" />

            <form onSubmit={onCreate} className={`${cardClass} flex gap-2 p-4`}>
                <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="שם קטגוריה חדשה" maxLength={40} aria-label="שם קטגוריה חדשה" />
                <Button type="submit" loading={create.isPending} disabled={!validName(newName)}>
                    <Plus className="size-4" /> הוספה
                </Button>
            </form>

            <ul className={`${cardClass} divide-y divide-stone-100`}>
                {categories.data.map((c) => (
                    <li key={c.id} className="flex items-center gap-3 px-5 py-3">
                        <span className="text-2xl" aria-hidden>
                            {categoryEmoji(c.name)}
                        </span>
                        {editing?.id === c.id ? (
                            <form onSubmit={onRename} className="flex flex-1 gap-2">
                                <Input
                                    autoFocus
                                    value={editing.name}
                                    onChange={(e) => setEditing({ id: c.id, name: e.target.value })}
                                    maxLength={40}
                                    aria-label="שם חדש"
                                />
                                <Button type="submit" size="md" variant="success" loading={rename.isPending} disabled={!validName(editing.name)} aria-label="שמירה">
                                    <Check className="size-4" />
                                </Button>
                                <Button size="md" variant="ghost" onClick={() => setEditing(null)} aria-label="ביטול">
                                    <X className="size-4" />
                                </Button>
                            </form>
                        ) : (
                            <>
                                <div className="flex-1">
                                    <p className="font-medium text-stone-800">{c.name}</p>
                                    <p className="text-xs text-stone-500">
                                        {c.recipeCount === 0 ? "אין מתכונים" : c.recipeCount === 1 ? "מתכון אחד" : `${c.recipeCount} מתכונים`}
                                    </p>
                                </div>
                                <Button size="sm" variant="ghost" onClick={() => setEditing({ id: c.id, name: c.name })} aria-label={`שינוי שם ${c.name}`}>
                                    <Pencil className="size-4" />
                                </Button>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-red-600 hover:bg-red-50"
                                    disabled={c.recipeCount > 0}
                                    title={c.recipeCount > 0 ? "יש בקטגוריה מתכונים" : "מחיקה"}
                                    onClick={() => setToDelete(c)}
                                    aria-label={`מחיקת ${c.name}`}
                                >
                                    <Trash2 className="size-4" />
                                </Button>
                            </>
                        )}
                    </li>
                ))}
            </ul>

            <ConfirmDialog
                open={toDelete !== null}
                title="למחוק את הקטגוריה?"
                message={toDelete && `הקטגוריה "${toDelete.name}" תימחק.`}
                loading={remove.isPending}
                onConfirm={() => toDelete && remove.mutate(toDelete.id)}
                onClose={() => setToDelete(null)}
            />
        </div>
    );
}
