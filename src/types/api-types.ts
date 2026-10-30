/**
 * טיפוסי TypeScript לכל מה שהשרת של "שיתוף מתכונים" מחזיר.
 *
 * מעתיקים את הקובץ לפרויקט ה־React, למשל ל־src/types/api.ts.
 * אפשר גם לפצל אותו לכמה קבצים (user.ts, recipe.ts, forum.ts...), לפי מבנה התיקיות שבחרת.
 *
 * הערות כלליות:
 * - תאריכים מגיעים מהשרת כמחרוזת בפורמט ISO, למשל "2026-10-28T10:00:00.000Z", ולכן הטיפוס שלהם string.
 * - "| null": השדה תמיד קיים בתשובה, אבל יכול להיות ריק (null).
 * - "?": השדה לא תמיד קיים בתשובה. למשל, שדות שרק הכותבת או המנהל מקבלים.
 * - הקובץ מכיל רק טיפוסים, בלי קוד שרץ.
 */

// ===================== ערכי בחירה =====================

export type Role = "USER" | "ADMIN";

/** EASY קל, MEDIUM בינוני, HARD מאתגר */
export type Difficulty = "EASY" | "MEDIUM" | "HARD";

/** MEAT בשרי, DAIRY חלבי, PAREVE פרווה */
export type KosherType = "MEAT" | "DAIRY" | "PAREVE";

/** PUBLIC ציבורי, PRIVATE פרטי */
export type Visibility = "PUBLIC" | "PRIVATE";

/** PENDING ממתין לאישור, APPROVED מאושר, REJECTED נדחה */
export type ModerationStatus = "PENDING" | "APPROVED" | "REJECTED";

/** NEW_ANSWER תשובה חדשה, CONTENT_APPROVED אושר, CONTENT_REJECTED נדחה */
export type NotificationType = "NEW_ANSWER" | "CONTENT_APPROVED" | "CONTENT_REJECTED";

// ===================== כללי =====================

/** עמוד תוצאות: כל הרשימות שתומכות ב־page ו־pageSize */
export interface Page<T> {
  items: T[];
  page: number;
  pageSize: number;
  /** סך כל התוצאות, בכל העמודים */
  total: number;
  totalPages: number;
}

/** שגיאה מהשרת: כל קוד 4xx או 5xx */
export interface ApiError {
  error: {
    /** למשל VALIDATION_ERROR, UNAUTHORIZED, FORBIDDEN, NOT_FOUND, CONFLICT */
    code: string;
    /** הודעה בעברית, אפשר להציג למשתמשת */
    message: string;
    /** רק בשגיאות ולידציה: שגיאה לכל שדה */
    details?: { field: string; message: string }[];
  };
}

/** GET /api/health */
export interface HealthResponse {
  status: "ok" | "degraded";
  database: "ok" | "error";
  time: string;
}

// ===================== משתמשת והתחברות =====================

/**
 * המשתמשת המחוברת עצמה, עם כל הפרטים שלה.
 * חוזרת מ: login, register, GET /api/auth/me, PATCH /api/users/me
 */
export interface User {
  id: number;
  /** אימייל ההתחברות. מוחזר רק למשתמשת עצמה */
  email: string;
  displayName: string;
  role: Role;
  /** אימייל ליצירת קשר. null אם לא מולא */
  contactEmail: string | null;
  /** טלפון ליצירת קשר, כמחרוזת (למשל "050-1234567"). null אם לא מולא */
  contactPhone: string | null;
  createdAt: string;
}

/** POST /api/auth/login, POST /api/auth/register */
export interface AuthResponse {
  token: string;
  user: User;
}

/** GET /api/auth/me, PATCH /api/users/me */
export interface UserResponse {
  user: User;
}

// ===================== כותב התוכן =====================

/**
 * הכותבת של מתכון, שאלה או תשובה.
 * אותו מבנה בדיוק ברשימת מתכונים, במתכון מלא, בספר שלי, בשאלות ובתשובות.
 *
 * contactEmail ו־contactPhone מופיעים רק אם בתוכן הזה סומן "הצגת פרטי הקשר שלי" (showContact).
 * כשהם מופיעים, כל אחד מהם יכול להיות null, אם לא מולא בפרופיל.
 */
export interface Author {
  id: number;
  displayName: string;
  contactEmail?: string | null;
  contactPhone?: string | null;
}

/** כותב בגרסה מקוצרת: רק בתור האישורים של המנהל */
export interface AuthorSummary {
  id: number;
  displayName: string;
}

// ===================== קטגוריות =====================

/** קטגוריה מקוצרת, כפי שהיא מופיעה בתוך מתכון או שאלה */
export interface CategoryRef {
  id: number;
  name: string;
}

/** פריט ב־GET /api/categories (מחזיר מערך: Category[]) */
export interface Category extends CategoryRef {
  /** מספר המתכונים הציבוריים המאושרים בקטגוריה */
  recipeCount: number;
}

/** POST /api/categories, PATCH /api/categories/:id */
export interface CategoryResponse {
  category: CategoryRef;
}

// ===================== מתכונים =====================

/** מתכון ברשימה: GET /api/recipes, GET /api/recipes/mine */
export interface RecipeListItem {
  id: number;
  title: string;
  description: string | null;
  category: CategoryRef;
  difficulty: Difficulty;
  kosherType: KosherType;
  /** בדקות. null אם לא מולא */
  prepTimeMinutes: number | null;
  servings: number | null;
  /** כרגע תמיד null, כי העלאת תמונות לא מופעלת */
  imageUrl: string | null;
  visibility: Visibility;
  status: ModerationStatus;
  /** רק לכותבת ולמנהל. null אם לא נדחה, או נדחה בלי סיבה */
  rejectionReason?: string | null;
  author: Author;
  /** כמה פעמים נשמר לספרים אישיים */
  saveCount: number;
  /** האם המשתמשת המחוברת שמרה אותו. לאורח תמיד false */
  isSaved: boolean;
  createdAt: string;
  updatedAt: string;
}

/** מתכון מלא: GET /api/recipes/:id */
export interface RecipeDetail extends RecipeListItem {
  /** רכיב בכל פריט, לפי הסדר */
  ingredients: string[];
  /** כולל ירידות שורה (\n). להצגה: white-space: pre-line */
  instructions: string;
  /** רק לכותבת: הערך לשליחה בעריכה. כרגע תמיד null */
  imagePath?: string | null;
  videoUrl: string | null;
  showContact: boolean;
  permissions: {
    canEdit: boolean;
    canDelete: boolean;
  };
}

/** GET /api/recipes/:id, POST /api/recipes, PATCH /api/recipes/:id */
export interface RecipeResponse {
  recipe: RecipeDetail;
}

// ===================== הספר שלי =====================

/** פריט ב־GET /api/cookbook */
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
  /** בספר תמיד true */
  isSaved: true;
  /** מתי נשמר לספר */
  savedAt: string;
  createdAt: string;
  updatedAt: string;
}

/** POST /api/cookbook/:recipeId (201 אם נשמר עכשיו, 200 אם כבר היה שמור) */
export interface SaveToCookbookResponse {
  saved: true;
  recipeId: number;
}

// ===================== פורום =====================

/** שאלה: פריט ב־GET /api/forum/questions, וגם שאלה בודדת */
export interface Question {
  id: number;
  title: string;
  body: string;
  /** null אם לא נבחרה קטגוריה */
  category: CategoryRef | null;
  /** מתכון קשור. null אם אין, או אם הצופה לא רשאי לראות אותו */
  recipe: { id: number; title: string } | null;
  imageUrl: string | null;
  /** רק לכותבת */
  imagePath?: string | null;
  videoUrl: string | null;
  isSolved: boolean;
  status: ModerationStatus;
  /** רק לכותבת ולמנהל */
  rejectionReason?: string | null;
  showContact: boolean;
  author: Author;
  /** מספר התשובות המאושרות */
  answerCount: number;
  createdAt: string;
  updatedAt: string;
  permissions: {
    canEdit: boolean;
    canDelete: boolean;
    canMarkSolved: boolean;
  };
}

/** GET /api/forum/questions/:id, POST, PATCH, PATCH .../solved */
export interface QuestionResponse {
  question: Question;
}

/** תשובה: פריט ב־GET /api/forum/questions/:id/answers (מחזיר מערך: Answer[]) */
export interface Answer {
  id: number;
  questionId: number;
  body: string;
  imageUrl: string | null;
  /** רק לכותב */
  imagePath?: string | null;
  videoUrl: string | null;
  status: ModerationStatus;
  /** רק לכותב ולמנהל */
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

/** POST /api/forum/questions/:id/answers, PATCH /api/forum/answers/:id */
export interface AnswerResponse {
  answer: Answer;
}

/** GET /api/forum/stats: למונה ליד "פורום עזרה" בתפריט */
export interface ForumStats {
  unansweredCount: number;
}

// ===================== התראות =====================

export interface Notification {
  id: number;
  type: NotificationType;
  message: string;
  /** לאן להוביל בלחיצה: "recipe" לדף מתכון, "question" לשאלה בפורום */
  entityType: "recipe" | "question";
  entityId: number;
  isRead: boolean;
  createdAt: string;
}

/** GET /api/notifications */
export interface NotificationPage extends Page<Notification> {
  /** מספר ההתראות שלא נקראו (לכל המשתמשת, לא רק בעמוד הזה) */
  unreadCount: number;
}

/** PATCH /api/notifications/:id/read */
export interface NotificationResponse {
  notification: Notification;
}

/** PATCH /api/notifications/read-all */
export interface ReadAllResponse {
  /** כמה התראות סומנו עכשיו כנקראו */
  updated: number;
}

// ===================== ניהול (מנהל) =====================

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
  /** השאלה שאליה שייכת התשובה */
  question: { id: number; title: string };
  imageUrl: string | null;
  videoUrl: string | null;
  author: AuthorSummary;
  createdAt: string;
  updatedAt: string;
}

/** GET /api/admin/pending (עם ?type=..., שתי הרשימות האחרות חוזרות ריקות) */
export interface PendingQueue {
  recipes: PendingRecipe[];
  questions: PendingQuestion[];
  answers: PendingAnswer[];
  /** סך כל הפריטים בשלוש הרשימות */
  total: number;
}

/** PATCH /api/admin/moderation/:type/:id */
export interface ModerationResult {
  type: "recipes" | "questions" | "answers";
  id: number;
  status: ModerationStatus;
  rejectionReason: string | null;
}

// ===================== תמונות (כרגע לא מופעל) =====================

/** POST /api/uploads/image (כרגע מחזיר 503, כי האחסון לא הוגדר) */
export interface UploadImageResponse {
  imagePath: string;
  imageUrl: string;
}

// ===================== עוזר אישי (תוספת) =====================

export interface AssistantRecipe {
  id: number;
  title: string;
  imageUrl: string | null;
  prepTimeMinutes: number | null;
  difficulty: Difficulty;
  kosherType: KosherType;
  /** הרכיבים במתכון שהתאימו למה שנכתב */
  matchedIngredients: string[];
  /** כמה מהמצרכים שנכתבו נמצאו במתכון */
  matchCount: number;
}

/** POST /api/assistant/ask */
export interface AssistantResponse {
  /** basic בלי AI, ai אם הוגדר מפתח AI בשרת */
  mode: "basic" | "ai";
  reply: string;
  detectedIngredients: string[];
  recipes: AssistantRecipe[];
}

// ===================== סיכום: מה כל קריאה מחזירה =====================
//
// POST   /api/auth/register                    → AuthResponse
// POST   /api/auth/login                       → AuthResponse
// GET    /api/auth/me                          → UserResponse
// PATCH  /api/users/me                         → UserResponse
//
// GET    /api/categories                       → Category[]
// POST   /api/categories                       → CategoryResponse
// PATCH  /api/categories/:id                   → CategoryResponse
// DELETE /api/categories/:id                   → (204, בלי תוכן)
//
// GET    /api/recipes                          → Page<RecipeListItem>
// GET    /api/recipes/mine                     → Page<RecipeListItem>
// GET    /api/recipes/:id                      → RecipeResponse
// POST   /api/recipes                          → RecipeResponse
// PATCH  /api/recipes/:id                      → RecipeResponse
// DELETE /api/recipes/:id                      → (204, בלי תוכן)
//
// GET    /api/cookbook                         → Page<CookbookItem>
// POST   /api/cookbook/:recipeId               → SaveToCookbookResponse
// DELETE /api/cookbook/:recipeId               → (204, בלי תוכן)
//
// GET    /api/forum/questions                  → Page<Question>
// GET    /api/forum/stats                      → ForumStats
// GET    /api/forum/questions/:id              → QuestionResponse
// POST   /api/forum/questions                  → QuestionResponse
// PATCH  /api/forum/questions/:id              → QuestionResponse
// PATCH  /api/forum/questions/:id/solved       → QuestionResponse
// DELETE /api/forum/questions/:id              → (204, בלי תוכן)
// GET    /api/forum/questions/:id/answers      → Answer[]
// POST   /api/forum/questions/:id/answers      → AnswerResponse
// PATCH  /api/forum/answers/:id                → AnswerResponse
// DELETE /api/forum/answers/:id                → (204, בלי תוכן)
//
// GET    /api/notifications                    → NotificationPage
// PATCH  /api/notifications/:id/read           → NotificationResponse
// PATCH  /api/notifications/read-all           → ReadAllResponse
//
// GET    /api/admin/pending                    → PendingQueue
// PATCH  /api/admin/moderation/:type/:id       → ModerationResult
//
// POST   /api/uploads/image                    → UploadImageResponse (כרגע 503)
// POST   /api/assistant/ask                    → AssistantResponse
// GET    /api/health                           → HealthResponse
//
// כל שגיאה (400, 401, 403, 404, 409, 413, 415, 429, 503) → ApiError
