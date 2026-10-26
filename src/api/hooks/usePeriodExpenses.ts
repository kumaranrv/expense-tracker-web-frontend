import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../client.ts";
import type { ExpenseEntry, PaginatedResponse } from "@/types";
import { getOutbox } from "@/offline/db";
import { applyOps } from "@/offline/overlay";

const PAGE_SIZE = 200;

/** Every expense in [startIso, endIso], paging through the API and overlaying unsynced local ops. */
export function usePeriodExpenses(startIso: string, endIso: string) {
    return useQuery({
        queryKey: ["expenses", "period", startIso, endIso],
        queryFn: async () => {
            const filters = { startDate: startIso, endDate: endIso, limit: PAGE_SIZE };
            const ops = await getOutbox();
            const rows: ExpenseEntry[] = [];
            let page = 1;
            let totalPages = 1;
            do {
                const { data } = await apiClient.get<PaginatedResponse<ExpenseEntry>>("/expenses", {
                    params: { startDate: startIso, endDate: endIso, page: String(page), limit: String(PAGE_SIZE) },
                });
                rows.push(...applyOps(data, ops, { ...filters, page }).data);
                totalPages = data.pagination.totalPages;
                page += 1;
            } while (page <= totalPages);
            return rows;
        },
    });
}
