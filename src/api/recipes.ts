import { api } from "./api";
import type {
    Category,
    CategoryResponse,
    CookbookItem,
    Difficulty,
    KosherType,
    ModerationStatus,
    Page,
    RecipeListItem,
    RecipeResponse,
    SaveToCookbookResponse,
    Visibility,
} from "../types/api-types";

export interface RecipeQuery {
    search?: string;
    categoryId?: number;
    difficulty?: Difficulty;
    kosherType?: KosherType;
    maxPrepTime?: number;
    ingredients?: string;
    sort?: "newest" | "prepTime" | "mostSaved";
    scope?: "public" | "visible" | "all";
    status?: ModerationStatus;
    visibility?: Visibility;
    page?: number;
    pageSize?: number;
}

export interface MyRecipesQuery {
    status?: ModerationStatus;
    visibility?: Visibility;
    search?: string;
    page?: number;
    pageSize?: number;
}

export interface RecipeInput {
    title: string;
    description: string | null;
    categoryId: number;
    difficulty: Difficulty;
    kosherType: KosherType;
    prepTimeMinutes: number | null;
    servings: number | null;
    ingredients: string;
    instructions: string;
    videoUrl: string | null;
    visibility: Visibility;
    showContact: boolean;
}


export async function getRecipes(params: RecipeQuery) {
    const response = await api.get<Page<RecipeListItem>>("/api/recipes", { params });
    return response.data;
}

export async function getMyRecipes(params: MyRecipesQuery) {
    const response = await api.get<Page<RecipeListItem>>("/api/recipes/mine", { params });
    return response.data;
}

export async function getRecipe(id: number) {
    const response = await api.get<RecipeResponse>(`/api/recipes/${id}`);
    return response.data.recipe;
}

export async function createRecipe(data: RecipeInput) {
    const response = await api.post<RecipeResponse>("/api/recipes", data);
    return response.data.recipe;
}

export async function updateRecipe(id: number, data: Partial<RecipeInput>) {
    const response = await api.patch<RecipeResponse>(`/api/recipes/${id}`, data);
    return response.data.recipe;
}

export async function deleteRecipe(id: number) {
    await api.delete(`/api/recipes/${id}`);
}


export async function getCategories() {
    const response = await api.get<Category[]>("/api/categories");
    return response.data;
}

export async function createCategory(name: string) {
    const response = await api.post<CategoryResponse>("/api/categories", { name });
    return response.data.category;
}

export async function renameCategory(id: number, name: string) {
    const response = await api.patch<CategoryResponse>(`/api/categories/${id}`, { name });
    return response.data.category;
}

export async function deleteCategory(id: number) {
    await api.delete(`/api/categories/${id}`);
}


export async function getCookbook(params: { search?: string; page?: number; pageSize?: number }) {
    const response = await api.get<Page<CookbookItem>>("/api/cookbook", { params });
    return response.data;
}

export async function saveToCookbook(recipeId: number) {
    const response = await api.post<SaveToCookbookResponse>(`/api/cookbook/${recipeId}`);
    return response.data;
}

export async function removeFromCookbook(recipeId: number) {
    await api.delete(`/api/cookbook/${recipeId}`);
}
