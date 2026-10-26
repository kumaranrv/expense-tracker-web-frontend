import { useCategories } from "../../api/hooks/useCategories";
import { Chip } from "../ui/Chip";

interface CategoryPickerProps {
    value: string | null;
    onChange: (category: string | null) => void;
    includeAllOption?: boolean;
}

/** Horizontal scrollable chip row — used both as a filter bar and as a form field. */
export function CategoryPicker({ value, onChange, includeAllOption }: CategoryPickerProps) {
    const { data: categories = [], isLoading } = useCategories();

    if (isLoading) return null;

    return (
        <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 py-1 md:px-6 lg:flex-wrap lg:overflow-visible lg:px-8">
            {includeAllOption && (
                <button
                    onClick={() => onChange(null)}
                    className={`shrink-0 rounded-full border px-3 py-1.5 text-sm font-medium ${
                        value === null
                            ? "border-transparent bg-slate-800 dark:bg-slate-600 text-white"
                            : "border-white/80 dark:border-white/10 bg-white/60 dark:bg-slate-800/60 text-slate-700 dark:text-slate-200 backdrop-blur"
                    }`}
                >
                    All
                </button>
            )}
            {categories.map((cat) => (
                <Chip key={cat} category={cat} active={value === cat} onClick={() => onChange(cat)} />
            ))}
        </div>
    );
}
