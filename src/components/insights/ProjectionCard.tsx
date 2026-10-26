import { Card } from "@/components/ui/Card";
import { money } from "@/utils/format";
import type { Projection } from "@/utils/insights";

export function ProjectionCard({ projection, budget, spent }: { projection: Projection; budget: number | null; spent: number }) {
    const scale = Math.max(projection.projected, budget ?? 0, spent, 1);
    const over = projection.overBy !== null && projection.overBy > 0;
    const pct = (v: number) => `${Math.min(100, (v / scale) * 100)}%`;

    return (
        <Card role="region" aria-labelledby="projection-title" className="h-full">
            <h2 id="projection-title" className="text-sm font-semibold text-slate-700 dark:text-slate-200">Projected month-end</h2>
            <p className={`mt-2 text-3xl font-bold tracking-tight ${over ? "text-red-700 dark:text-red-300" : "text-slate-900 dark:text-slate-50"}`}>
                {money(projection.projected)}
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-300">Based on {money(projection.dailyRate)}/day so far</p>

            <div className="relative mt-5 h-3 rounded-full bg-slate-200 dark:bg-slate-700" role="img"
                 aria-label={`Projected ${money(projection.projected)}${budget ? ` against budget ${money(budget)}` : ""}`}>
                <div className="absolute inset-y-0 left-0 rounded-full bg-slate-400/60 dark:bg-slate-500/60" style={{ width: pct(projection.projected) }}/>
                <div className={`absolute inset-y-0 left-0 rounded-full ${over ? "bg-red-600" : "bg-teal-700"}`} style={{ width: pct(spent) }}/>
                {budget ? <div className="absolute -top-1 h-5 w-0.5 rounded bg-slate-900 dark:bg-slate-700" style={{ left: pct(budget) }}/> : null}
            </div>
            <p className={`mt-2 text-xs font-semibold ${over ? "text-red-700 dark:text-red-300" : "text-emerald-700 dark:text-emerald-300"}`}>
                {projection.overBy === null
                    ? "Set a monthly budget to compare"
                    : over
                        ? `▲ ${money(projection.overBy)} over budget`
                        : `▼ ${money(projection.overBy)} under budget`}
            </p>
            {budget ? <p className="text-[11px] text-slate-500 dark:text-slate-400">Marker = budget {money(budget)}</p> : null}
        </Card>
    );
}
