import { categoryEmoji, categoryGradient } from "../../lib/labels";
import type { CategoryRef } from "../../types/api-types";

interface RecipeImageProps {
    imageUrl: string | null;
    title: string;
    category: CategoryRef;
    className?: string;
    emojiSize?: string;
}

export function RecipeImage({ imageUrl, title, category, className = "", emojiSize = "text-5xl" }: RecipeImageProps) {
    if (imageUrl) {
        return <img src={imageUrl} alt={title} loading="lazy" className={`object-cover ${className}`} />;
    }
    return (
        <div className={`flex items-center justify-center bg-gradient-to-br ${categoryGradient(category.id)} ${className}`}>
            <span className={`${emojiSize} drop-shadow-sm`} aria-hidden>
                {categoryEmoji(category.name)}
            </span>
        </div>
    );
}
