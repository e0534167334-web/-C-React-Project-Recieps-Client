import { api } from "./api";
import type { AssistantResponse } from "../types/api-types";

export async function askAssistant(message: string) {
    const response = await api.post<AssistantResponse>("/api/assistant/ask", { message });
    return response.data;
}
