import { Card } from "@/components/ui/Card";
import type { Insight } from "@/utils/insights";

const TONE: Record<Insight["tone"], { icon: string; cls: string }> = {
    good: { icon: "✓", cls: "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200" },
    warn: { icon: "!", cls: "bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200" },
    info: { icon: "i", cls: "bg-sky-100 dark:bg-sky-900/50 text-sky-800 dark:text-sky-200" },
};

export function InsightsFeed({ insights }: { insights: Insight[] }) {
    return (
        <Card role="region" aria-labelledby="insights-title" className="h-full">
            <h2 id="insights-title" className="text-sm font-semibold text-slate-700 dark:text-slate-200">Insights</h2>
            {insights.length === 0 ? (
                <p className="py-6 text-center text-sm text-slate-500 dark:text-slate-400">Add a few expenses to see insights</p>
            ) : (
                <ul className="mt-3 space-y-2.5">
                    {insights.map((i) => (
                        <li key={i.id} className="flex items-start gap-3 text-sm text-slate-800 dark:text-slate-100">
                            <span aria-hidden="true" className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold ${TONE[i.tone].cls}`}>
                                {TONE[i.tone].icon}
                            </span>
                            {i.text}
                        </li>
                    ))}
                </ul>
            )}
        </Card>
    );
}
