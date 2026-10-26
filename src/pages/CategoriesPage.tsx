import { TopHeader } from "../components/layout/TopHeader";
import { Card } from "../components/ui/Card";
import { ProgressBar } from "../components/ui/ProgressBar";
import { useCategorySpending } from "../api/hooks/useDashboard";
import { money } from "../utils/format";
import { categoryEmoji, categoryLabel } from "../utils/categoryColors";
import { Skeleton } from "../components/ui/Skeleton";

export default function CategoriesPage() {
    const { data: categories, isLoading } = useCategorySpending();

    return (
        <div className="pb-4">
            <TopHeader title="Categories" />

            <div className="grid gap-3 px-4 pt-2 md:grid-cols-2 md:px-6 lg:gap-4 lg:px-8 xl:grid-cols-3">
                {isLoading || !categories
                    ? Array.from({ length: 5 }).map((_, i) => (
                        <Skeleton key={i} className="h-20 w-full" />
                    ))
                    : categories.map((cat) => {
                        const pct = cat.budgetThreshold ? (cat.total / cat.budgetThreshold) * 100 : null;
                        return (
                            <Card key={cat.name}>
                                <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-sm font-medium text-slate-800 dark:text-slate-100">
                      <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: cat.color }}
                      />
                        {categoryEmoji(cat.name)} {categoryLabel(cat.name)}
                    </span>
                                    <span className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                      {money(cat.total)}
                    </span>
                                </div>
                                {pct !== null && (
                                    <div className="mt-3">
                                        <ProgressBar
                                            percent={pct}
                                            colorClass="bg-brand-500 dark:bg-teal-700"
                                            trackClass="bg-slate-100 dark:bg-slate-800"
                                        />
                                        <p className="mt-1 text-xs text-slate-400">
                                            {money(cat.budgetThreshold!)} threshold · {pct.toFixed(0)}% used
                                        </p>
                                    </div>
                                )}
                            </Card>
                        );
                    })}
            </div>
        </div>
    );
}
