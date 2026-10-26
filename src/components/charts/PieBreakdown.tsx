import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { CategoryBreakdown } from "../../types";
import { money } from "../../utils/format";
import { useChartTheme } from "../../hooks/useChartTheme";

interface PieBreakdownProps {
    data: CategoryBreakdown[];
}

export function PieBreakdown({ data }: PieBreakdownProps) {
    const theme = useChartTheme();
    if (data.length === 0) {
        return <p className="py-8 text-center text-sm text-slate-400">No spending yet this period</p>;
    }

    return (
        <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        dataKey="total"
                        nameKey="name"
                        innerRadius="55%"
                        outerRadius="90%"
                        paddingAngle={2}
                        strokeWidth={0}
                    >
                        {data.map((entry) => (
                            <Cell key={entry.name} fill={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip
                        formatter={(value: number, name: string) => [money(value), name]}
                        contentStyle={{ borderRadius: 12, fontSize: 12, border: "none", ...theme.tooltip }}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}
