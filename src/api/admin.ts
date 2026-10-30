import { api } from "./api";
import type { ModerationResult, PendingQueue } from "../types/api-types";

export type ModerationType = "recipes" | "questions" | "answers";

export async function getPendingQueue() {
    const response = await api.get<PendingQueue>("/api/admin/pending");
    return response.data;
}

export async function moderate(
    type: ModerationType,
    id: number,
    decision: "APPROVED" | "REJECTED",
    reason?: string
) {
    const response = await api.patch<ModerationResult>(`/api/admin/moderation/${type}/${id}`, {
        decision,
        reason: reason || undefined,
    });
    return response.data;
}
