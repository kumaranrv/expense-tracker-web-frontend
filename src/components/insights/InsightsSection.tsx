import { Skeleton } from "@/components/ui/Skeleton";
import { useInsights } from "./useInsights";
import { SafeToSpendCard } from "./SafeToSpendCard";
import { ProjectionCard } from "./ProjectionCard";
import { MonthDeltaCard } from "./MonthDeltaCard";
import { StreakGoalCard } from "./StreakGoalCard";
import { SpendingHeatmap } from "./SpendingHeatmap";
import { CategoryRings } from "./CategoryRings";
import { BiggestExpenses } from "./BiggestExpenses";
import { InsightsFeed } from "./InsightsFeed";

export function InsightsSection() {
    const { model, isLoading, isError, categories, savingsGoal } = useInsights();

    if (isLoading) {
        return (
            <div className="grid gap-4 lg:col-span-12 lg:grid-cols-12 lg:gap-6" aria-busy="true">
                <Skeleton className="h-44 lg:col-span-4"/>
                <Skeleton className="h-44 lg:col-span-4"/>
                <Skeleton className="h-44 lg:col-span-4"/>
            </div>
        );
    }
    if (isError || !model) {
        return (
            <p role="alert" className="rounded-2xl border border-red-100 dark:border-red-900 bg-red-50 dark:bg-red-950/40 p-4 text-sm text-red-700 dark:text-red-300 lg:col-span-12">
                Couldn't load spending insights.
            </p>
        );
    }

    const { budget, spent, win } = model;
    return (
        <>
            <div className="lg:col-span-4">
                {model.safe && budget
                    ? <SafeToSpendCard safe={model.safe} budget={budget} spent={spent} win={win}/>
                    : <InsightsFeed insights={model.insights}/>}
            </div>
            <div className="lg:col-span-4"><ProjectionCard projection={model.projection} budget={budget} spent={spent}/></div>
            <div className="lg:col-span-4"><StreakGoalCard streak={model.streak} budget={budget} spent={spent} goal={savingsGoal}/></div>
            <div className="lg:col-span-6"><MonthDeltaCard delta={model.delta}/></div>
            <div className="lg:col-span-6"><SpendingHeatmap daily={model.daily} win={win}/></div>
            <div className="lg:col-span-6"><CategoryRings categories={categories}/></div>
            <div className="lg:col-span-6"><BiggestExpenses expenses={model.biggest}/></div>
            {model.safe && <div className="lg:col-span-12"><InsightsFeed insights={model.insights}/></div>}
        </>
    );
}
