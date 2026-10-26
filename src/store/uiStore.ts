import { create } from "zustand";

type Period = "week" | "month";

interface UIState {
    period: Period;
    setPeriod: (p: Period) => void;

    isAddSheetOpen: boolean;
    openAddSheet: () => void;
    closeAddSheet: () => void;

    editingExpenseId: string | null;
    setEditingExpenseId: (id: string | null) => void;

    activeCategoryFilter: string | null;
    setActiveCategoryFilter: (category: string | null) => void;
}

export const useUIStore = create<UIState>((set) => ({
    period: "month",
    setPeriod: (p) => set({ period: p }),

    isAddSheetOpen: false,
    openAddSheet: () => set({ isAddSheetOpen: true, editingExpenseId: null }),
    closeAddSheet: () => set({ isAddSheetOpen: false, editingExpenseId: null }),

    editingExpenseId: null,
    setEditingExpenseId: (id) => set({ editingExpenseId: id, isAddSheetOpen: !!id }),

    activeCategoryFilter: null,
    setActiveCategoryFilter: (category) => set({ activeCategoryFilter: category }),
}));
