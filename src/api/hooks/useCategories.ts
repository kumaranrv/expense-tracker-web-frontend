import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../client";

export function useCategories() {
    return useQuery({
        queryKey: ["categories"],
        queryFn: async () => {
            const { data } = await apiClient.get<{ categories: string[] }>("/categories");
            return data.categories;
        },
        staleTime: Infinity, // static config list, rarely changes
    });
}
