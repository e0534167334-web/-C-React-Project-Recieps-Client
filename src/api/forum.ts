import { api } from "./api";
import type {
    Answer,
    AnswerResponse,
    ForumStats,
    ModerationStatus,
    Page,
    Question,
    QuestionResponse,
} from "../types/api-types";

export interface QuestionQuery {
    search?: string;
    categoryId?: number;
    solved?: boolean;
    unanswered?: boolean;
    scope?: "visible" | "all";
    status?: ModerationStatus;
    sort?: "newest" | "oldest";
    page?: number;
    pageSize?: number;
}

export interface QuestionInput {
    title: string;
    body: string;
    categoryId: number | null;
    recipeId: number | null;
    videoUrl: string | null;
    showContact: boolean;
}

export interface AnswerInput {
    body: string;
    videoUrl: string | null;
    showContact: boolean;
}

export async function getQuestions(params: QuestionQuery) {
    const response = await api.get<Page<Question>>("/api/forum/questions", { params });
    return response.data;
}

export async function getQuestion(id: number) {
    const response = await api.get<QuestionResponse>(`/api/forum/questions/${id}`);
    return response.data.question;
}

export async function createQuestion(data: QuestionInput) {
    const response = await api.post<QuestionResponse>("/api/forum/questions", data);
    return response.data.question;
}

export async function updateQuestion(id: number, data: Partial<QuestionInput>) {
    const response = await api.patch<QuestionResponse>(`/api/forum/questions/${id}`, data);
    return response.data.question;
}

export async function setQuestionSolved(id: number, isSolved: boolean) {
    const response = await api.patch<QuestionResponse>(`/api/forum/questions/${id}/solved`, { isSolved });
    return response.data.question;
}

export async function deleteQuestion(id: number) {
    await api.delete(`/api/forum/questions/${id}`);
}

export async function getAnswers(questionId: number) {
    const response = await api.get<Answer[]>(`/api/forum/questions/${questionId}/answers`);
    return response.data;
}

export async function createAnswer(questionId: number, data: AnswerInput) {
    const response = await api.post<AnswerResponse>(`/api/forum/questions/${questionId}/answers`, data);
    return response.data.answer;
}

export async function updateAnswer(id: number, data: Partial<AnswerInput>) {
    const response = await api.patch<AnswerResponse>(`/api/forum/answers/${id}`, data);
    return response.data.answer;
}

export async function deleteAnswer(id: number) {
    await api.delete(`/api/forum/answers/${id}`);
}

export async function getForumStats() {
    const response = await api.get<ForumStats>("/api/forum/stats");
    return response.data;
}
