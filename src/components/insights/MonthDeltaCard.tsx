import { Card } from "@/components/ui/Card";
import { money } from "@/utils/format";
import { categoryEmoji, categoryLabel } from "@/utils/categoryColors";
import type { MonthDelta } from "@/utils/insights";

export function MonthDeltaCard({ delta }: { delta: MonthDelta }) {
    const more = delta.delta > 0;
    const same = delta.delta === 0;
    const headline = same
        ? "Same as last month"
        : `${money(delta.delta)} ${more ? "more" : "less"} than last month`;

    return (
        <Card role="region" aria-labelledby="mom-title" className="h-full">
            <h2 id="mom-title" className="text-sm font-semibold text-slate-700 dark:text-slate-200">Month over month</h2>
            <p className={`mt-2 text-xl font-bold ${same ? "text-slate-900 dark:text-slate-50" : more ? "text-red-700 dark:text-red-300" : "text-emerald-700 dark:text-emerald-300"}`}>
                <span aria-hidden="true">{same ? "" : more ? "▲ " : "▼ "}</span>{headline}
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-300">Compared with the same days last month ({money(delta.previous)})</p>
            <ul className="mt-3 divide-y divide-slate-100 dark:divide-slate-700">
                {delta.categories.map((c) => (
                    <li key={c.name} className="flex items-center justify-between py-2 text-sm">
                        <span className="text-slate-700 dark:text-slate-200">{categoryEmoji(c.name)} {categoryLabel(c.name)}</span>
                        <DeltaBadge value={c.delta} pct={c.pct}/>
                    </li>
                ))}
            </ul>
        </Card>
    );
}

function DeltaBadge({ value, pct }: { value: number; pct: number | null }) {
    if (value === 0) return <span className="text-xs text-slate-600 dark:text-slate-300">—</span>;
    const up = value > 0;
    return (
        <span className={`text-xs font-semibold ${up ? "text-red-700 dark:text-red-300" : "text-emerald-700 dark:text-emerald-300"}`}>
            <span aria-hidden="true">{up ? "▲" : "▼"}</span>
            <span className="sr-only">{up ? "up" : "down"}</span> {money(value)}
            {pct !== null && ` (${Math.abs(Math.round(pct))}%)`}
        </span>
    );
}
