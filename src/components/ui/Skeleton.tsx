import clsx from "clsx";

export function Skeleton({ className }: { className?: string }) {
    return <div className={clsx("animate-pulse rounded-xl bg-slate-200/70 dark:bg-slate-700/70", className)} />;
}

export function DashboardSkeleton() {
    return (
        <div className="grid gap-4 px-4 pt-4 md:px-6 lg:grid-cols-12 lg:gap-6 lg:px-8">
            <Skeleton className="h-40 w-full rounded-3xl lg:col-span-12" />
            <Skeleton className="h-56 w-full rounded-2xl lg:col-span-5 lg:h-80" />
            <Skeleton className="h-40 w-full rounded-2xl lg:col-span-7 lg:h-80" />
        </div>
    );
}

export function MonthlyOverviewSkeleton() {
    return (
        <div className="space-y-4 px-4 pt-4">
            <Skeleton className="h-28 w-full rounded-3xl" />
            <div className="grid grid-cols-3 gap-3">
                <Skeleton className="h-20 w-full rounded-2xl" />
                <Skeleton className="h-20 w-full rounded-2xl" />
                <Skeleton className="h-20 w-full rounded-2xl" />
            </div>
            <Skeleton className="h-56 w-full rounded-2xl" />
            <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
    );
}

export function ExpenseListSkeleton() {
    return (
        <div className="grid gap-3 px-4 pt-4 md:px-6 lg:px-8 xl:grid-cols-2">
            {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-2xl" />
            ))}
        </div>
    );
}
