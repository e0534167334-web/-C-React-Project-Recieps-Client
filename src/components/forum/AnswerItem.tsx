import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Mail, Pencil, Phone, PlayCircle, Trash2 } from "lucide-react";
import { deleteAnswer, updateAnswer } from "../../api/forum";
import { getErrorMessage } from "../../api/api";
import { useToast } from "../../context/useToast";
import { formatRelativeDate } from "../../lib/labels";
import type { Answer } from "../../types/api-types";
import { StatusBadge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Textarea } from "../ui/Field";
import { ConfirmDialog } from "../ui/Modal";

export function AnswerItem({ answer, isQuestionAuthor }: { answer: Answer; isQuestionAuthor: boolean }) {
    const toast = useToast();
    const queryClient = useQueryClient();
    const [editing, setEditing] = useState(false);
    const [body, setBody] = useState(answer.body);
    const [confirmDelete, setConfirmDelete] = useState(false);

    const refresh = () => queryClient.invalidateQueries({ queryKey: ["forum"] });

    const save = useMutation({
        mutationFn: () => updateAnswer(answer.id, { body: body.trim() }),
        onSuccess: (updated) => {
            setEditing(false);
            refresh();
            toast(updated.status === "PENDING" ? "התשובה עודכנה ותפורסם שוב אחרי אישור" : "התשובה עודכנה");
        },
        onError: (error) => toast(getErrorMessage(error), "error"),
    });

    const remove = useMutation({
        mutationFn: () => deleteAnswer(answer.id),
        onSuccess: () => {
            refresh();
            toast("התשובה נמחקה");
        },
        onError: (error) => {
            setConfirmDelete(false);
            toast(getErrorMessage(error), "error");
        },
    });

    const { author } = answer;

    return (
        <li className="flex gap-3">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-stone-100 text-sm font-semibold text-stone-600">
                {author.displayName.charAt(0)}
            </span>
            <div className="min-w-0 flex-1 rounded-2xl rounded-tr-md bg-stone-50 px-4 py-3">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-semibold text-stone-800">{author.displayName}</span>
                    {isQuestionAuthor && <span className="text-brand-600">כותב/ת השאלה</span>}
                    <span className="text-stone-400">{formatRelativeDate(answer.createdAt)}</span>
                    {answer.status !== "APPROVED" && <StatusBadge status={answer.status} />}
                </div>

                {editing ? (
                    <div className="mt-2 space-y-2">
                        <Textarea value={body} onChange={(e) => setBody(e.target.value)} rows={3} aria-label="עריכת התשובה" />
                        <div className="flex justify-end gap-2">
                            <Button size="sm" variant="ghost" onClick={() => { setEditing(false); setBody(answer.body); }}>
                                ביטול
                            </Button>
                            <Button size="sm" loading={save.isPending} disabled={body.trim().length < 2} onClick={() => save.mutate()}>
                                שמירה
                            </Button>
                        </div>
                    </div>
                ) : (
                    <p className="mt-1.5 text-sm leading-relaxed whitespace-pre-line text-stone-700">{answer.body}</p>
                )}

                {answer.status === "REJECTED" && answer.rejectionReason && (
                    <p className="mt-2 text-xs text-red-600">סיבת הדחייה: {answer.rejectionReason}</p>
                )}

                {answer.videoUrl && (
                    <a href={answer.videoUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:underline">
                        <PlayCircle className="size-4" /> צפייה בסרטון
                    </a>
                )}

                {(author.contactEmail || author.contactPhone) && (
                    <div className="mt-2 flex flex-wrap gap-3 text-xs text-stone-500">
                        {author.contactEmail && (
                            <a href={`mailto:${author.contactEmail}`} className="flex items-center gap-1 hover:text-stone-800">
                                <Mail className="size-3.5" /> <span dir="ltr">{author.contactEmail}</span>
                            </a>
                        )}
                        {author.contactPhone && (
                            <a href={`tel:${author.contactPhone}`} className="flex items-center gap-1 hover:text-stone-800">
                                <Phone className="size-3.5" /> <span dir="ltr">{author.contactPhone}</span>
                            </a>
                        )}
                    </div>
                )}

                {!editing && (answer.permissions.canEdit || answer.permissions.canDelete) && (
                    <div className="mt-2 flex gap-3 text-xs">
                        {answer.permissions.canEdit && (
                            <button type="button" onClick={() => setEditing(true)} className="flex items-center gap-1 text-stone-500 hover:text-stone-800">
                                <Pencil className="size-3.5" /> עריכה
                            </button>
                        )}
                        {answer.permissions.canDelete && (
                            <button type="button" onClick={() => setConfirmDelete(true)} className="flex items-center gap-1 text-stone-500 hover:text-red-600">
                                <Trash2 className="size-3.5" /> מחיקה
                            </button>
                        )}
                    </div>
                )}
            </div>

            <ConfirmDialog
                open={confirmDelete}
                title="למחוק את התשובה?"
                message="התשובה תימחק לצמיתות."
                loading={remove.isPending}
                onConfirm={() => remove.mutate()}
                onClose={() => setConfirmDelete(false)}
            />
        </li>
    );
}
