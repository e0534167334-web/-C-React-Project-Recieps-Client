import type { Difficulty, KosherType, ModerationStatus, Visibility } from "../types/api-types";

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
    EASY: "קל",
    MEDIUM: "בינוני",
    HARD: "מאתגר",
};

export const KOSHER_LABELS: Record<KosherType, string> = {
    MEAT: "בשרי",
    DAIRY: "חלבי",
    PAREVE: "פרווה",
};

export const VISIBILITY_LABELS: Record<Visibility, string> = {
    PUBLIC: "ציבורי",
    PRIVATE: "פרטי",
};

export const STATUS_LABELS: Record<ModerationStatus, string> = {
    PENDING: "ממתין לאישור",
    APPROVED: "מאושר",
    REJECTED: "נדחה",
};

export const DIFFICULTIES = Object.keys(DIFFICULTY_LABELS) as Difficulty[];
export const KOSHER_TYPES = Object.keys(KOSHER_LABELS) as KosherType[];
export const STATUSES = Object.keys(STATUS_LABELS) as ModerationStatus[];

/** סיבות דחייה מוכנות לבחירה בתור האישורים */
export const REJECTION_REASONS = [
    "התמונה או הסרטון לא קשורים לתוכן",
    "תוכן לא מתאים לאתר",
    "הקישור לסרטון לא תקין",
    "תוכן כפול",
];

/** 90 → "שעה ו־30 דק׳" */
export function formatPrepTime(minutes: number | null): string | null {
    if (minutes === null) return null;
    if (minutes < 60) return `${minutes} דק׳`;
    const hours = Math.floor(minutes / 60);
    const rest = minutes % 60;
    const hoursText = hours === 1 ? "שעה" : hours === 2 ? "שעתיים" : `${hours} שעות`;
    return rest ? `${hoursText} ו־${rest} דק׳` : hoursText;
}

const relative = new Intl.RelativeTimeFormat("he", { numeric: "auto" });
const fullDate = new Intl.DateTimeFormat("he", { day: "numeric", month: "long", year: "numeric" });

/** "לפני 3 ימים", ותאריך מלא אחרי חודש */
export function formatRelativeDate(iso: string): string {
    const seconds = (new Date(iso).getTime() - Date.now()) / 1000;
    const abs = Math.abs(seconds);
    if (abs < 60) return "עכשיו";
    if (abs < 3600) return relative.format(Math.round(seconds / 60), "minute");
    if (abs < 86400) return relative.format(Math.round(seconds / 3600), "hour");
    if (abs < 86400 * 30) return relative.format(Math.round(seconds / 86400), "day");
    return fullDate.format(new Date(iso));
}

const CATEGORY_EMOJIS: [string, string][] = [
    ["עוג", "🍰"],
    ["מאפ", "🥐"],
    ["לחם", "🍞"],
    ["בוקר", "🍳"],
    ["מרק", "🍲"],
    ["סלט", "🥗"],
    ["בשר", "🍗"],
    ["עוף", "🍗"],
    ["דג", "🐟"],
    ["קינוח", "🍮"],
    ["תוספ", "🥔"],
    ["פסט", "🍝"],
    ["משק", "🥤"],
];

/** אימוג׳י לפי שם הקטגוריה, לכרטיסי מתכון בלי תמונה */
export function categoryEmoji(name: string): string {
    return CATEGORY_EMOJIS.find(([key]) => name.includes(key))?.[1] ?? "🍽️";
}

const GRADIENTS = [
    "from-orange-100 to-amber-50",
    "from-rose-100 to-orange-50",
    "from-lime-100 to-emerald-50",
    "from-amber-100 to-yellow-50",
    "from-sky-100 to-cyan-50",
    "from-violet-100 to-fuchsia-50",
];

/** רקע קבוע לכל קטגוריה */
export function categoryGradient(categoryId: number): string {
    return GRADIENTS[categoryId % GRADIENTS.length];
}
