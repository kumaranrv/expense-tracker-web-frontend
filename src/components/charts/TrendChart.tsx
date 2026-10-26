import {
    BarChart,
    Bar,
    Cell,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
} from "recharts";
import { TrendPoint } from "../../types";
import { money } from "../../utils/format";
import { useChartTheme } from "../../hooks/useChartTheme";

interface TrendChartProps {
    data: TrendPoint[];
    selectedMonthKey?: string;
    onSelectMonth?: (month: TrendPoint) => void;
}

export function TrendChart({ data, selectedMonthKey, onSelectMonth }: TrendChartProps) {
    const theme = useChartTheme();
    return (
        <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" stroke={theme.grid} />
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
                    <Bar
                        dataKey="total"
                        fill={theme.accent}
                        radius={[6, 6, 0, 0]}
                        maxBarSize={28}
                        onClick={(_, index) => onSelectMonth?.(data[index])}
                    >
                        {data.map((month) => (
                            <Cell
                                key={month.monthKey}
                                fill={!selectedMonthKey || month.monthKey === selectedMonthKey ? theme.accent : theme.muted}
                                cursor={onSelectMonth ? "pointer" : undefined}
                                role={onSelectMonth ? "button" : undefined}
                                tabIndex={onSelectMonth ? 0 : undefined}
                                aria-label={`Show categories for ${month.label}`}
                                aria-pressed={month.monthKey === selectedMonthKey}
                                onKeyDown={(event) => {
                                    if (event.key === "Enter" || event.key === " ") {
                                        event.preventDefault();
                                        onSelectMonth?.(month);
                                    }
                                }}
                            />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
