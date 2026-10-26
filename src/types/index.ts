export interface ExpenseEntry {
    expenseId: string;
    date: number; // epoch millis
    description: string;
    amount: number;
    category?: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface CategoryBreakdown {
    name: string;
    total: number;
    color: string;
}

export interface DashboardSummary {
    expenseTotal: number;
    incomeTotal?: number;
    budget?: number | null;
    topTags: CategoryBreakdown[];
}

export interface MonthlyOverviewEntry {
    monthKey: string; // "yyyyMM"
    label: string; // "Mar 2026"
    total: number;
}

export interface TrendPoint {
    monthKey: string;
    label: string;
    total: number;
}

export interface CategorySpending extends CategoryBreakdown {
    budgetThreshold?: number | null;
}

export interface AppSettings {
    monthlyBudget?: number | null;
    categoryThresholds: Record<string, number>;
    currency: string;
    savingsGoal?: number | null;
}

export type ExpenseFilters = {
    startDate?: string;
    endDate?: string;
    category?: string;
    search?: string;
    page?: number;
    limit?: number;
};
