import {useState} from "react";
import {TopHeader} from "../components/layout/TopHeader";
import {CategoryPicker} from "../components/expenses/CategoryPicker";
import {ExpenseList} from "../components/expenses/ExpenseList";
import {useUIStore} from "@/store/uiStore.ts";
import {useExpenses} from "@/api/hooks/useExpenses.ts";
import {ExpenseListSkeleton} from "@/components/ui/Skeleton.tsx";
import type {ExpenseDateRange} from "../components/expenses/ExpenseDateFilter";
import {ExpenseDateFilter, toExpenseDateParams} from "../components/expenses/ExpenseDateFilter";


export default function ExpensesPage() {
    const [search, setSearch] = useState("");
    const [dateRange, setDateRange] = useState<ExpenseDateRange>({startDate: "", endDate: ""});
    const activeCategory = useUIStore((s) => s.activeCategoryFilter);
    const setActiveCategory = useUIStore((s) => s.setActiveCategoryFilter);

    const {data, isLoading} = useExpenses({
        ...toExpenseDateParams(dateRange),
        category: activeCategory ?? undefined,
        search: search || undefined,
        limit: 100,
    });

    return (
        <div className="pb-4">
            <TopHeader title="Expenses"/>

            <div className="grid min-w-0 grid-cols-1 gap-2 px-4 pb-2 md:px-6 lg:max-w-xl lg:px-8">
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search expenses…"
                    className="min-w-0 w-full rounded-xl border border-white/80 dark:border-white/10 bg-white/70 dark:bg-slate-800/70 px-4 backdrop-blur py-2.5 text-sm focus:border-brand-500 dark:focus:border-teal-400 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:focus:ring-teal-400"
                />
                <ExpenseDateFilter onApply={setDateRange}/>
            </div>

            <CategoryPicker
                value={activeCategory}
                onChange={setActiveCategory}
                includeAllOption
            />

            <div className="mt-2">
                {isLoading ? (
                    <ExpenseListSkeleton/>
                ) : (
                    <ExpenseList expenses={data?.data ?? []}/>
                )}
            </div>
        </div>
    );
}
