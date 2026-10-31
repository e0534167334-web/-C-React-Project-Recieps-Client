

export type Role = "USER" | "ADMIN";

export type Difficulty = "EASY" | "MEDIUM" | "HARD";

export type KosherType = "MEAT" | "DAIRY" | "PAREVE";

export type Visibility = "PUBLIC" | "PRIVATE";

export type ModerationStatus = "PENDING" | "APPROVED" | "REJECTED";

export type NotificationType = "NEW_ANSWER" | "CONTENT_APPROVED" | "CONTENT_REJECTED";


export interface Page<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: { field: string; message: string }[];
  };
}

export interface HealthResponse {
  status: "ok" | "degraded";
  database: "ok" | "error";
  time: string;
}


export interface User {
  id: number;
  email: string;
  displayName: string;
  role: Role;
  contactEmail: string | null;
  contactPhone: string | null;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface UserResponse {
  user: User;
}


export interface Author {
  id: number;
  displayName: string;
  contactEmail?: string | null;
  contactPhone?: string | null;
}

export interface AuthorSummary {
  id: number;
  displayName: string;
}


export interface CategoryRef {
  id: number;
  name: string;
}

export interface Category extends CategoryRef {
  recipeCount: number;
}

export interface CategoryResponse {
  category: CategoryRef;
}


export interface RecipeListItem {
  id: number;
  title: string;
  description: string | null;
  category: CategoryRef;
  difficulty: Difficulty;
  kosherType: KosherType;
  prepTimeMinutes: number | null;
  servings: number | null;
  imageUrl: string | null;
  visibility: Visibility;
  status: ModerationStatus;
  rejectionReason?: string | null;
  author: Author;
  saveCount: number;
  isSaved: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RecipeDetail extends RecipeListItem {
  ingredients: string[];
  instructions: string;
  imagePath?: string | null;
  videoUrl: string | null;
  showContact: boolean;
  permissions: {
    canEdit: boolean;
    canDelete: boolean;
  };
}

export interface RecipeResponse {
  recipe: RecipeDetail;
}


export interface CookbookItem {
  id: number;
  title: string;
  description: string | null;
  category: CategoryRef;
  difficulty: Difficulty;
  kosherType: KosherType;
  prepTimeMinutes: number | null;
  servings: number | null;
  imageUrl: string | null;
  visibility: Visibility;
  status: ModerationStatus;
  author: Author;
  saveCount: number;
  isSaved: true;
  savedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface SaveToCookbookResponse {
  saved: true;
  recipeId: number;
}


export interface Question {
  id: number;
  title: string;
  body: string;
  category: CategoryRef | null;
  recipe: { id: number; title: string } | null;
  imageUrl: string | null;
  imagePath?: string | null;
  videoUrl: string | null;
  isSolved: boolean;
  status: ModerationStatus;
  rejectionReason?: string | null;
  showContact: boolean;
  author: Author;
  answerCount: number;
  createdAt: string;
  updatedAt: string;
  permissions: {
    canEdit: boolean;
    canDelete: boolean;
    canMarkSolved: boolean;
  };
}

export interface QuestionResponse {
  question: Question;
}

export interface Answer {
  id: number;
  questionId: number;
  body: string;
  imageUrl: string | null;
  imagePath?: string | null;
  videoUrl: string | null;
  status: ModerationStatus;
  rejectionReason?: string | null;
  showContact: boolean;
  author: Author;
  createdAt: string;
  updatedAt: string;
  permissions: {
    canEdit: boolean;
    canDelete: boolean;
  };
}

export interface AnswerResponse {
  answer: Answer;
}

export interface ForumStats {
  unansweredCount: number;
}


export interface Notification {
  id: number;
  type: NotificationType;
  message: string;
  entityType: "recipe" | "question";
  entityId: number;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationPage extends Page<Notification> {
  unreadCount: number;
}

export interface NotificationResponse {
  notification: Notification;
}

export interface ReadAllResponse {
  updated: number;
}


export interface PendingRecipe {
  id: number;
  title: string;
  description: string | null;
  category: CategoryRef;
  imageUrl: string | null;
  videoUrl: string | null;
  author: AuthorSummary;
  createdAt: string;
  updatedAt: string;
}

export interface PendingQuestion {
  id: number;
  title: string;
  body: string;
  imageUrl: string | null;
  videoUrl: string | null;
  author: AuthorSummary;
  createdAt: string;
  updatedAt: string;
}

export interface PendingAnswer {
  id: number;
  body: string;
  question: { id: number; title: string };
  imageUrl: string | null;
  videoUrl: string | null;
  author: AuthorSummary;
  createdAt: string;
  updatedAt: string;
}

export interface PendingQueue {
  recipes: PendingRecipe[];
  questions: PendingQuestion[];
  answers: PendingAnswer[];
  total: number;
}

export interface ModerationResult {
  type: "recipes" | "questions" | "answers";
  id: number;
  status: ModerationStatus;
  rejectionReason: string | null;
}


export interface UploadImageResponse {
  imagePath: string;
  imageUrl: string;
}


export interface AssistantRecipe {
  id: number;
  title: string;
  imageUrl: string | null;
  prepTimeMinutes: number | null;
  difficulty: Difficulty;
  kosherType: KosherType;
  matchedIngredients: string[];
  matchCount: number;
}

export interface AssistantResponse {
  mode: "basic" | "ai";
  reply: string;
  detectedIngredients: string[];
  recipes: AssistantRecipe[];
}

