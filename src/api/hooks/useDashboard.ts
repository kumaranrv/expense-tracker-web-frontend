import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../client.ts";
import {
    DashboardSummary,
    MonthlyOverviewEntry,
    TrendPoint,
    CategorySpending,
} from "@/types";

export function useDashboardSummary(monthKey?: string) {
    return useQuery({
        queryKey: monthKey ? ["dashboard", "summary", monthKey] : ["dashboard", "summary"],
        queryFn: async () => {
            const { data } = await apiClient.get<DashboardSummary>("/dashboard/summary", {
                params: monthKey ? { monthKey } : undefined,
            });
            return data;
        },
    });
}

export function useMonthlyOverview() {
    return useQuery({
        queryKey: ["dashboard", "monthly-overview"],
        queryFn: async () => {
            const { data } = await apiClient.get<MonthlyOverviewEntry[]>(
                "/dashboard/monthly-overview"
            );
            return data;
        },
    });
}

export function useTrend() {
    return useQuery({
        queryKey: ["dashboard", "trend"],
        queryFn: async () => {
            const { data } = await apiClient.get<TrendPoint[]>("/dashboard/trend");
            return data;
        },
    });
}

export function useCategorySpending() {
    return useQuery({
        queryKey: ["dashboard", "category-spending"],
        queryFn: async () => {
            const { data } = await apiClient.get<CategorySpending[]>(
                "/dashboard/category-spending"
            );
            return data;
        },
    });
}
