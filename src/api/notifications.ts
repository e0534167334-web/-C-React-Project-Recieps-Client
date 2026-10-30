import { api } from "./api";
import type { NotificationPage, NotificationResponse, ReadAllResponse } from "../types/api-types";

export async function getNotifications(params: { unreadOnly?: boolean; page?: number; pageSize?: number }) {
    const response = await api.get<NotificationPage>("/api/notifications", { params });
    return response.data;
}

export async function markNotificationRead(id: number) {
    const response = await api.patch<NotificationResponse>(`/api/notifications/${id}/read`);
    return response.data.notification;
}

export async function markAllNotificationsRead() {
    const response = await api.patch<ReadAllResponse>("/api/notifications/read-all");
    return response.data;
}
