import clsx from "clsx";
import { useUIStore } from "../../store/uiStore";

interface TopHeaderProps {
    title: string;
    showPeriodToggle?: boolean;
}

export function TopHeader({ title, showPeriodToggle }: TopHeaderProps) {
    const period = useUIStore((s) => s.period);
    const setPeriod = useUIStore((s) => s.setPeriod);

    return (
        <header className="sticky top-0 z-20 flex items-center justify-between bg-sky-50/80 dark:bg-slate-900/80 px-4 pb-2 pt-[max(env(safe-area-inset-top),1rem)] md:px-6 lg:px-8 lg:pb-4 lg:pt-8 backdrop-blur">
            <h1 className="text-[clamp(1.25rem,1rem+1vw,1.875rem)] font-bold text-slate-900 dark:text-slate-50">{title}</h1>

            {showPeriodToggle && (
                <div className="flex rounded-full bg-sky-200/70 dark:bg-slate-700/70 p-0.5 text-sm">
                    {(["week", "month"] as const).map((p) => (
                        <button
                            key={p}
                            onClick={() => setPeriod(p)}
                            className={clsx(
                                "rounded-full px-3 py-1 font-medium capitalize transition-colors",
                                period === p ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 shadow-sm" : "text-slate-500 dark:text-slate-400"
                            )}
                        >
                            {p}
                        </button>
                    ))}
                </div>
            )}
        </header>
    );
}
