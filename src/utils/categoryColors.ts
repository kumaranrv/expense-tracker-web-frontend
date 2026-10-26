/**
 * Ported from the Android app's CategoryColors.kt so the web UI keeps the
 * same visual language/category-to-color mapping.
 */
export function categoryColor(category: string): string {
    if (category.includes("Rent")) return "#3949AB";
    if (category.includes("Food")) return "#EF6C00";
    if (category.includes("Travel")) return "#00897B";
    if (category.includes("Online Shopping")) return "#8E24AA";
    if (category.includes("Grocery")) return "#43A047";
    if (category.includes("Clothes")) return "#D81B60";
    if (category.includes("Drinks")) return "#5E35B1";
    if (category.includes("Investment")) return "#0288D1";
    if (category.includes("Utility")) return "#6D4C41";
    return "#546E7A";
}

export function categoryEmoji(category: string): string {
    const parts = category.trim().split(/\s+/);
    return parts.length > 1 ? parts[0] : "🏷️";
}

export function categoryLabel(category: string): string {
    const parts = category.trim().split(/\s+/);
    return parts.length > 1 ? parts.slice(1).join(" ") : category;
}
