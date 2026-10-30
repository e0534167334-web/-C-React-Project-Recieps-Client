import { api } from "./api";
import type { AuthResponse, UserResponse } from "../types/api-types";

export interface LoginInput {
    email: string;
    password: string;
}

export interface RegisterInput extends LoginInput {
    displayName: string;
}

export interface ProfileInput {
    displayName?: string;
    contactEmail?: string | null;
    contactPhone?: string | null;
}

export async function loginRequest(data: LoginInput) {
    const response = await api.post<AuthResponse>("/api/auth/login", data);
    return response.data;
}

export async function registerRequest(data: RegisterInput) {
    const response = await api.post<AuthResponse>("/api/auth/register", data);
    return response.data;
}

export async function getMe() {
    const response = await api.get<UserResponse>("/api/auth/me");
    return response.data.user;
}

export async function updateProfile(data: ProfileInput) {
    const response = await api.patch<UserResponse>("/api/users/me", data);
    return response.data.user;
}
