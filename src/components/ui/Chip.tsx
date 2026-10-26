import clsx from "clsx";
import { categoryColor, categoryEmoji, categoryLabel } from "../../utils/categoryColors";

interface ChipProps {
    category: string;
    active?: boolean;
    onClick?: () => void;
}

export function Chip({ category, active, onClick }: ChipProps) {
    const color = categoryColor(category);
    return (
        <button
            onClick={onClick}
            className={clsx(
                "flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors",
                active ? "text-white border-transparent" : "text-slate-700 dark:text-slate-200 border-white/80 dark:border-white/10 bg-white/60 dark:bg-slate-800/60 backdrop-blur"
            )}
            style={active ? { backgroundColor: color } : undefined}
        >
            <span>{categoryEmoji(category)}</span>
            <span>{categoryLabel(category)}</span>
        </button>
    );
}
