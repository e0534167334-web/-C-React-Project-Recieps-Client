import { useCallback, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Bell, CheckCheck, CheckCircle2, MessageCircle, XCircle } from "lucide-react";
import { getNotifications, markAllNotificationsRead, markNotificationRead } from "../../api/notifications";
import { useClickOutside } from "../../hooks/useClickOutside";
import { formatRelativeDate } from "../../lib/labels";
import type { Notification, NotificationType } from "../../types/api-types";
import { Spinner } from "../ui/States";

const TYPE_ICONS: Record<NotificationType, { icon: typeof Bell; className: string }> = {
    NEW_ANSWER: { icon: MessageCircle, className: "bg-sky-50 text-sky-600" },
    CONTENT_APPROVED: { icon: CheckCircle2, className: "bg-emerald-50 text-emerald-600" },
    CONTENT_REJECTED: { icon: XCircle, className: "bg-red-50 text-red-600" },
};

function notificationLink(n: Notification): string {
    if (n.entityType === "recipe") return `/recipes/${n.entityId}`;
    if (n.entityType === "question") return `/forum?open=${n.entityId}`;
    return "/forum";
}

export function NotificationBell() {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const close = useCallback(() => setOpen(false), []);
    useClickOutside(ref, close, open);

    const countQuery = useQuery({
        queryKey: ["notifications", "count"],
        queryFn: () => getNotifications({ unreadOnly: true, pageSize: 1 }),
        refetchInterval: 60_000,
    });

    const listQuery = useQuery({
        queryKey: ["notifications", "list"],
        queryFn: () => getNotifications({ pageSize: 10 }),
        enabled: open,
    });

    const refresh = () => queryClient.invalidateQueries({ queryKey: ["notifications"] });

    const readOne = useMutation({ mutationFn: markNotificationRead, onSuccess: refresh });
    const readAll = useMutation({ mutationFn: markAllNotificationsRead, onSuccess: refresh });

    const unread = countQuery.data?.unreadCount ?? 0;

    const onClick = (n: Notification) => {
        if (!n.isRead) readOne.mutate(n.id);
        setOpen(false);
        navigate(notificationLink(n));
    };

    return (
        <div ref={ref} className="relative">
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="relative flex size-10 items-center justify-center rounded-xl text-stone-600 transition hover:bg-stone-100 hover:text-stone-900"
                aria-label={unread ? `התראות, ${unread} לא נקראו` : "התראות"}
                aria-expanded={open}
            >
                <Bell className="size-5" />
                {unread > 0 && (
                    <span className="absolute -top-0.5 -end-0.5 flex min-w-5 items-center justify-center rounded-full bg-brand-500 px-1 text-[11px] font-bold leading-5 text-white ring-2 ring-white">
                        {unread > 9 ? "9+" : unread}
                    </span>
                )}
            </button>

            {open && (
                <div className="absolute end-0 top-12 z-40 w-[min(22rem,calc(100vw-2rem))] animate-slide-up overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-card-hover">
                    <div className="flex items-center justify-between border-b border-stone-100 px-4 py-3">
                        <h3 className="font-semibold text-stone-900">התראות</h3>
                        {unread > 0 && (
                            <button
                                type="button"
                                onClick={() => readAll.mutate()}
                                disabled={readAll.isPending}
                                className="flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700"
                            >
                                <CheckCheck className="size-4" />
                                סימון הכול כנקרא
                            </button>
                        )}
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                        {listQuery.isPending ? (
                            <div className="flex justify-center py-10">
                                <Spinner />
                            </div>
                        ) : listQuery.isError ? (
                            <p className="px-4 py-10 text-center text-sm text-red-600">לא הצלחנו לטעון את ההתראות</p>
                        ) : listQuery.data.items.length === 0 ? (
                            <div className="px-4 py-10 text-center">
                                <p className="text-3xl">🔔</p>
                                <p className="mt-2 text-sm text-stone-500">אין התראות עדיין</p>
                            </div>
                        ) : (
                            <ul className="divide-y divide-stone-100">
                                {listQuery.data.items.map((n) => {
                                    const { icon: Icon, className } = TYPE_ICONS[n.type];
                                    return (
                                        <li key={n.id}>
                                            <button
                                                type="button"
                                                onClick={() => onClick(n)}
                                                className={`flex w-full items-start gap-3 px-4 py-3 text-start transition hover:bg-stone-50 ${n.isRead ? "" : "bg-brand-50/40"}`}
                                            >
                                                <span className={`flex size-8 shrink-0 items-center justify-center rounded-full ${className}`}>
                                                    <Icon className="size-4" />
                                                </span>
                                                <span className="flex-1">
                                                    <span className={`block text-sm ${n.isRead ? "text-stone-600" : "font-medium text-stone-900"}`}>
                                                        {n.message}
                                                    </span>
                                                    <span className="mt-0.5 block text-xs text-stone-400">
                                                        {formatRelativeDate(n.createdAt)}
                                                    </span>
                                                </span>
                                                {!n.isRead && <span className="mt-2 size-2 shrink-0 rounded-full bg-brand-500" />}
                                            </button>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
