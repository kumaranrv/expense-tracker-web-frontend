import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { MonthlyOverviewEntry } from "@/types";
import { money } from "@/utils/format";
import { useChartTheme } from "@/hooks/useChartTheme";

interface MonthlyBarChartProps {
    data: MonthlyOverviewEntry[];
    /** monthKey of the bar to render in the accent color (typically the current month) */
    highlightMonthKey?: string;
}

export function MonthlyBarChart({ data, highlightMonthKey }: MonthlyBarChartProps) {
    const theme = useChartTheme();
    if (data.length === 0) {
        return <p className="py-8 text-center text-sm text-slate-400">No spending history yet</p>;
    }

    return (
        <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                    <XAxis
                        dataKey="label"
                        tick={{ fontSize: 11, fill: theme.tick }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <YAxis hide />
                    <Tooltip
                        cursor={{ fill: theme.cursor }}
                        formatter={(value: number) => [money(value), "Spent"]}
                        contentStyle={{ borderRadius: 12, fontSize: 12, border: "none", ...theme.tooltip }}
                    />
                    <Bar dataKey="total" radius={[6, 6, 0, 0]} maxBarSize={28}>
                        {data.map((entry) => (
                            <Cell
                                key={entry.monthKey}
                                fill={entry.monthKey === highlightMonthKey ? theme.accent : theme.muted}
                            />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
