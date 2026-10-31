import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { Clock, SendHorizontal, Sparkles, X } from "lucide-react";
import { askAssistant } from "../../api/assistant";
import { getErrorMessage } from "../../api/api";
import { formatPrepTime } from "../../lib/labels";
import type { AssistantRecipe } from "../../types/api-types";
import { Spinner } from "../ui/States";

interface ChatMessage {
    id: number;
    from: "me" | "bot";
    text: string;
    recipes?: AssistantRecipe[];
}

const EXAMPLES = ["יש לי ביצים, קישואים וגבינה", "משהו מהיר עם עוף", "עוגה פרווה"];

let nextId = 1;

export function AssistantWidget() {
    const [open, setOpen] = useState(false);
    const [text, setText] = useState("");
    const [messages, setMessages] = useState<ChatMessage[]>([
        { id: 0, from: "bot", text: "היי! ספרו לי מה יש לכם במקרר, ואמצא מתכונים מתאימים מהאתר 🥕" },
    ]);
    const bottomRef = useRef<HTMLDivElement>(null);

    const ask = useMutation({
        mutationFn: askAssistant,
        onSuccess: (data) =>
            setMessages((m) => [...m, { id: nextId++, from: "bot", text: data.reply, recipes: data.recipes }]),
        onError: (error) => setMessages((m) => [...m, { id: nextId++, from: "bot", text: getErrorMessage(error) }]),
    });

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, ask.isPending]);

    const send = (message: string) => {
        const trimmed = message.trim();
        if (trimmed.length < 2 || ask.isPending) return;
        setMessages((m) => [...m, { id: nextId++, from: "me", text: trimmed }]);
        setText("");
        ask.mutate(trimmed);
    };

    const onSubmit = (e: FormEvent) => {
        e.preventDefault();
        send(text);
    };

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="fixed bottom-5 start-5 z-40 flex items-center gap-2 rounded-full bg-stone-900 p-3.5 text-sm font-medium text-white shadow-card-hover transition hover:bg-stone-800 active:scale-95 sm:py-3 sm:ps-4 sm:pe-5"
                aria-expanded={open}
                aria-label={open ? "סגירת העוזר" : "מה לבשל?"}
            >
                {open ? <X className="size-5" /> : <Sparkles className="size-5 text-brand-300" />}
                <span className="hidden sm:inline">{open ? "סגירה" : "מה לבשל?"}</span>
            </button>

            {open && (
                <div className="fixed bottom-20 start-5 z-40 flex h-[min(32rem,calc(100svh-7rem))] w-[min(24rem,calc(100vw-2.5rem))] animate-slide-up flex-col overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-card-hover">
                    <div className="flex items-center gap-3 bg-gradient-to-l from-brand-500 to-brand-600 px-5 py-4 text-white">
                        <span className="flex size-9 items-center justify-center rounded-full bg-white/20">
                            <Sparkles className="size-5" />
                        </span>
                        <div>
                            <p className="font-semibold">העוזר האישי</p>
                            <p className="text-xs text-white/80">מוצא מתכונים לפי מה שיש בבית</p>
                        </div>
                    </div>

                    <div className="flex-1 space-y-3 overflow-y-auto bg-stone-50 p-4">
                        {messages.map((m) => (
                            <div key={m.id} className={`flex ${m.from === "me" ? "justify-end" : "justify-start"}`}>
                                <div
                                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                                        m.from === "me"
                                            ? "rounded-bl-md bg-brand-500 text-white"
                                            : "rounded-br-md border border-stone-200 bg-white text-stone-700"
                                    }`}
                                >
                                    <p className="whitespace-pre-line">{m.text}</p>
                                    {m.recipes && m.recipes.length > 0 && (
                                        <ul className="mt-3 space-y-2">
                                            {m.recipes.map((r) => (
                                                <li key={r.id}>
                                                    <Link
                                                        to={`/recipes/${r.id}`}
                                                        onClick={() => setOpen(false)}
                                                        className="block rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 transition hover:border-brand-300 hover:bg-brand-50"
                                                    >
                                                        <span className="block font-medium text-stone-900">{r.title}</span>
                                                        <span className="mt-0.5 flex items-center gap-2 text-xs text-stone-500">
                                                            {r.prepTimeMinutes !== null && (
                                                                <span className="flex items-center gap-1">
                                                                    <Clock className="size-3" />
                                                                    {formatPrepTime(r.prepTimeMinutes)}
                                                                </span>
                                                            )}
                                                            <span>{r.matchCount} מצרכים מתאימים</span>
                                                        </span>
                                                    </Link>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </div>
                        ))}
                        {ask.isPending && (
                            <div className="flex justify-start">
                                <div className="rounded-2xl rounded-br-md border border-stone-200 bg-white px-4 py-3">
                                    <Spinner className="size-4" />
                                </div>
                            </div>
                        )}
                        {messages.length === 1 && (
                            <div className="flex flex-wrap justify-start gap-2 pt-2">
                                {EXAMPLES.map((ex) => (
                                    <button
                                        key={ex}
                                        type="button"
                                        onClick={() => send(ex)}
                                        className="rounded-full border border-brand-200 bg-white px-3 py-1.5 text-xs text-brand-700 transition hover:bg-brand-50"
                                    >
                                        {ex}
                                    </button>
                                ))}
                            </div>
                        )}
                        <div ref={bottomRef} />
                    </div>

                    <form onSubmit={onSubmit} className="flex items-center gap-2 border-t border-stone-100 p-3">
                        <input
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            maxLength={500}
                            placeholder="למשל: יש לי עגבניות ופסטה"
                            className="flex-1 rounded-full border border-stone-200 bg-stone-50 px-4 py-2.5 text-sm focus:border-brand-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-100"
                            aria-label="הודעה לעוזר"
                        />
                        <button
                            type="submit"
                            disabled={text.trim().length < 2 || ask.isPending}
                            className="flex size-10 items-center justify-center rounded-full bg-brand-500 text-white transition hover:bg-brand-600 disabled:opacity-40"
                            aria-label="שליחה"
                        >
                            <SendHorizontal className="size-4 -scale-x-100" />
                        </button>
                    </form>
                </div>
            )}
        </>
    );
}
