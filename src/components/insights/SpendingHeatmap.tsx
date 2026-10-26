import { Card } from "@/components/ui/Card";
import { money } from "@/utils/format";
import type { MonthWindow } from "@/utils/insights";

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];
// Teal ramp; darker steps keep >=4.5:1 against white text.
const SHADES = [
    "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200",
    "bg-teal-200 text-slate-900 dark:bg-teal-900 dark:text-teal-50",
    "bg-teal-400 text-slate-900 dark:bg-teal-700 dark:text-white",
    "bg-teal-600 text-white dark:bg-teal-500 dark:text-slate-900",
    "bg-teal-800 text-white dark:bg-teal-300 dark:text-slate-900",
];

function level(value: number, max: number): number {
    if (value <= 0 || max <= 0) return 0;
    return Math.min(4, Math.ceil((value / max) * 4));
}

export function SpendingHeatmap({ daily, win }: { daily: number[]; win: MonthWindow }) {
    const max = Math.max(...daily, 0);
    const offset = new Date(win.year, win.month, 1).getDay();
    const cells: (number | null)[] = [...Array<null>(offset).fill(null), ...daily.map((_, i) => i)];

    return (
        <Card role="region" aria-labelledby="heatmap-title" className="h-full">
            <h2 id="heatmap-title" className="text-sm font-semibold text-slate-700 dark:text-slate-200">Spending heatmap</h2>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">Darker days are higher spend</p>
            <div className="mt-3 grid grid-cols-7 gap-1.5 text-center" role="grid" aria-label="Daily spending calendar">
                {WEEKDAYS.map((d, i) => (
                    <span key={i} role="columnheader" className="text-[11px] font-medium text-slate-500 dark:text-slate-400">{d}</span>
                ))}
                {cells.map((idx, i) =>
                    idx === null ? (
                        <span key={`pad-${i}`} role="gridcell" aria-hidden="true"/>
                    ) : (
                        <span
                            key={idx}
                            role="gridcell"
                            tabIndex={-1}
                            title={`${idx + 1}: ${money(daily[idx])}`}
                            aria-label={`Day ${idx + 1}, ${money(daily[idx])} spent`}
                            className={`flex aspect-square items-center justify-center rounded-md text-[11px] font-medium ${SHADES[level(daily[idx], max)]} ${
                                idx + 1 === win.dayOfMonth ? "ring-2 ring-brand-500 ring-offset-1 dark:ring-teal-300 dark:ring-offset-slate-900" : ""
                            } ${
                                idx + 1 > win.dayOfMonth ? "opacity-50" : ""
                            }`}
                        >
                            {idx + 1}
                        </span>
                    )
                )}
            </div>
        </Card>
    );
}
