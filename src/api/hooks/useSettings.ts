import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../client.ts";
import type { AppSettings } from "@/types";

const KEY = ["settings"];

export function useSettings() {
    return useQuery({
        queryKey: KEY,
        queryFn: async () => (await apiClient.get<AppSettings>("/settings")).data,
    });
}

export function useUpdateSettings() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (patch: Partial<Pick<AppSettings, "savingsGoal" | "monthlyBudget">>) =>
            (await apiClient.patch<AppSettings>("/settings", patch)).data,
        onSuccess: (data) => qc.setQueryData(KEY, data),
    });
}
