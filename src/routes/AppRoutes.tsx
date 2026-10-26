import { Routes, Route } from "react-router-dom";
import DashboardPage from "../pages/DashboardPage";
import ExpensesPage from "../pages/ExpensesPage";
import CategoriesPage from "../pages/CategoriesPage";
import { BottomSheet } from "../components/ui/BottomSheet";
import { ExpenseForm } from "../components/expenses/ExpenseForm";
import { useUIStore } from "../store/uiStore";

export function AppRoutes() {
    const isAddSheetOpen = useUIStore((s) => s.isAddSheetOpen);
    const closeAddSheet = useUIStore((s) => s.closeAddSheet);
    const editingExpenseId = useUIStore((s) => s.editingExpenseId);

    return (
        <>
            <Routes>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/expenses" element={<ExpensesPage />} />
                <Route path="/categories" element={<CategoriesPage />} />
            </Routes>

            {/* Global Add/Edit Expense bottom sheet, reachable from the FAB on any page */}
            <BottomSheet
                open={isAddSheetOpen}
                onClose={closeAddSheet}
                title={editingExpenseId ? "Edit Expense" : "Add Expense"}
            >
                <ExpenseForm />
            </BottomSheet>
        </>
    );
}
