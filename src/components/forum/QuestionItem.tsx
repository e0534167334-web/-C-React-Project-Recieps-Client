import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { CheckCircle2, ChevronDown, CircleDot, Mail, MessageCircle, Pencil, Phone, PlayCircle, Trash2, UtensilsCrossed } from "lucide-react";
import { deleteQuestion, getAnswers, setQuestionSolved } from "../../api/forum";
import { getErrorMessage } from "../../api/api";
import { useAuth } from "../../context/useAuth";
import { useToast } from "../../context/useToast";
import { formatRelativeDate } from "../../lib/labels";
import { buttonClass } from "../../lib/ui";
import type { Question } from "../../types/api-types";
import { Badge, StatusBadge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { ConfirmDialog } from "../ui/Modal";
import { Spinner } from "../ui/States";
import { AnswerForm } from "./AnswerForm";
import { AnswerItem } from "./AnswerItem";

interface QuestionItemProps {
    question: Question;
    open: boolean;
    onToggle: () => void;
}

export function QuestionItem({ question, open, onToggle }: QuestionItemProps) {
    return (
        <li
            id={`question-${question.id}`}
            className={`overflow-hidden rounded-2xl border bg-white transition ${
                open ? "border-brand-200 shadow-card-hover" : "border-stone-200/70 shadow-card hover:border-stone-300"
            }`}
        >
            <button type="button" onClick={onToggle} className="flex w-full items-start gap-4 p-5 text-start" aria-expanded={open}>
                <span
                    className={`mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full ${
                        question.isSolved ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                    }`}
                    title={question.isSolved ? "נפתרה" : "פתוחה"}
                >
                    {question.isSolved ? <CheckCircle2 className="size-5" /> : <CircleDot className="size-5" />}
                </span>
                <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-stone-900">{question.title}</span>
                        {question.status !== "APPROVED" && <StatusBadge status={question.status} />}
                    </span>
                    {!open && <span className="mt-1 line-clamp-1 block text-sm text-stone-500">{question.body}</span>}
                    <span className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-stone-500">
                        <Badge tone={question.isSolved ? "green" : "amber"}>{question.isSolved ? "נפתרה" : "פתוחה"}</Badge>
                        {question.category && <Badge>{question.category.name}</Badge>}
                        <span>{question.author.displayName}</span>
                        <span>·</span>
                        <span>{formatRelativeDate(question.createdAt)}</span>
                    </span>
                </span>
                <span className="flex shrink-0 flex-col items-center gap-1">
                    <span
                        className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                            question.answerCount ? "bg-sky-50 text-sky-700" : "bg-stone-100 text-stone-500"
                        }`}
                    >
                        <MessageCircle className="size-3.5" />
                        {question.answerCount}
                    </span>
                    <ChevronDown className={`size-4 text-stone-400 transition ${open ? "rotate-180" : ""}`} />
                </span>
            </button>
            {open && <QuestionThread question={question} />}
        </li>
    );
}

function QuestionThread({ question }: { question: Question }) {
    const { user } = useAuth();
    const toast = useToast();
    const queryClient = useQueryClient();
    const [confirmDelete, setConfirmDelete] = useState(false);

    const answers = useQuery({
        queryKey: ["forum", "answers", question.id],
        queryFn: () => getAnswers(question.id),
    });

    const refresh = () => queryClient.invalidateQueries({ queryKey: ["forum"] });

    const solve = useMutation({
        mutationFn: () => setQuestionSolved(question.id, !question.isSolved),
        onSuccess: (q) => {
            refresh();
            toast(q.isSolved ? "השאלה סומנה כנפתרה ✅" : "השאלה נפתחה מחדש");
        },
        onError: (error) => toast(getErrorMessage(error), "error"),
    });

    const remove = useMutation({
        mutationFn: () => deleteQuestion(question.id),
        onSuccess: () => {
            refresh();
            toast("השאלה נמחקה");
        },
        onError: (error) => {
            setConfirmDelete(false);
            toast(getErrorMessage(error), "error");
        },
    });

    const { author, permissions } = question;

    return (
        <div className="animate-fade-in border-t border-stone-100 px-5 pt-4 pb-5">
            <p className="leading-relaxed whitespace-pre-line text-stone-700">{question.body}</p>

            <div className="mt-3 flex flex-wrap gap-2">
                {question.recipe && (
                    <Link to={`/recipes/${question.recipe.id}`} className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700 hover:bg-brand-100">
                        <UtensilsCrossed className="size-3.5" /> {question.recipe.title}
                    </Link>
                )}
                {question.videoUrl && (
                    <a href={question.videoUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-700 hover:bg-stone-200">
                        <PlayCircle className="size-3.5" /> צפייה בסרטון
                    </a>
                )}
                {author.contactEmail && (
                    <a href={`mailto:${author.contactEmail}`} className="inline-flex items-center gap-1.5 rounded-full bg-stone-100 px-3 py-1 text-xs text-stone-700 hover:bg-stone-200">
                        <Mail className="size-3.5" /> <span dir="ltr">{author.contactEmail}</span>
                    </a>
                )}
                {author.contactPhone && (
                    <a href={`tel:${author.contactPhone}`} className="inline-flex items-center gap-1.5 rounded-full bg-stone-100 px-3 py-1 text-xs text-stone-700 hover:bg-stone-200">
                        <Phone className="size-3.5" /> <span dir="ltr">{author.contactPhone}</span>
                    </a>
                )}
            </div>

            {question.status === "REJECTED" && question.rejectionReason && (
                <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">סיבת הדחייה: {question.rejectionReason}</p>
            )}

            {(permissions.canMarkSolved || permissions.canEdit || permissions.canDelete) && (
                <div className="mt-4 flex flex-wrap gap-2">
                    {permissions.canMarkSolved && (
                        <Button size="sm" variant={question.isSolved ? "secondary" : "success"} loading={solve.isPending} onClick={() => solve.mutate()}>
                            <CheckCircle2 className="size-4" />
                            {question.isSolved ? "סימון כפתוחה" : "סימון כנפתרה"}
                        </Button>
                    )}
                    {permissions.canEdit && (
                        <Link to={`/forum/${question.id}/edit`} className={buttonClass("secondary", "sm")}>
                            <Pencil className="size-3.5" /> עריכה
                        </Link>
                    )}
                    {permissions.canDelete && (
                        <Button size="sm" variant="ghost" className="text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => setConfirmDelete(true)}>
                            <Trash2 className="size-3.5" /> מחיקה
                        </Button>
                    )}
                </div>
            )}

            <div className="mt-6">
                <h4 className="mb-3 text-sm font-semibold text-stone-800">
                    {answers.data ? (answers.data.length === 1 ? "תשובה אחת" : `${answers.data.length} תשובות`) : "תשובות"}
                </h4>
                {answers.isPending ? (
                    <div className="flex justify-center py-6">
                        <Spinner />
                    </div>
                ) : answers.isError ? (
                    <p className="text-sm text-red-600">{getErrorMessage(answers.error)}</p>
                ) : answers.data.length === 0 ? (
                    <p className="rounded-xl bg-stone-50 px-4 py-4 text-center text-sm text-stone-500">
                        עדיין אין תשובות. אולי יש לך רעיון? 💡
                    </p>
                ) : (
                    <ul className="space-y-3">
                        {answers.data.map((a) => (
                            <AnswerItem key={a.id} answer={a} isQuestionAuthor={a.author.id === author.id} />
                        ))}
                    </ul>
                )}
            </div>

            <div className="mt-5 border-t border-stone-100 pt-5">
                {question.status !== "APPROVED" ? (
                    <p className="text-sm text-stone-500">אפשר לענות על השאלה אחרי שתאושר.</p>
                ) : user ? (
                    <AnswerForm questionId={question.id} />
                ) : (
                    <p className="text-sm text-stone-500">
                        <Link to="/login" state={{ from: `/forum?open=${question.id}` }} className="font-medium text-brand-600 hover:underline">
                            התחברו
                        </Link>{" "}
                        כדי לענות על השאלה.
                    </p>
                )}
            </div>

            <ConfirmDialog
                open={confirmDelete}
                title="למחוק את השאלה?"
                message="השאלה וכל התשובות שלה יימחקו לצמיתות."
                loading={remove.isPending}
                onConfirm={() => remove.mutate()}
                onClose={() => setConfirmDelete(false)}
            />
        </div>
    );
}
