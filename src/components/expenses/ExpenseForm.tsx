import { useEffect, useState } from "react";
import { Button } from "../ui/Button";
import { CategoryPicker } from "./CategoryPicker";
import {
    useCreateExpense,
    useUpdateExpense,
    useExpenses,
} from "../../api/hooks/useExpenses";
import { useSoftDeleteExpense } from "../../api/hooks/useSoftDeleteExpense";
import { useUIStore } from "../../store/uiStore";

function toDateInputValue(millis: number) {
    return new Date(millis).toISOString().slice(0, 10);
}

/** Shared form for both Add and Edit flows, rendered inside the BottomSheet. */
export function ExpenseForm() {
    const closeAddSheet = useUIStore((s) => s.closeAddSheet);
    const editingExpenseId = useUIStore((s) => s.editingExpenseId);

    // Pull the editing target out of the currently cached list (simple approach for a small personal dataset)
    const { data: page } = useExpenses({ limit: 200 });
    const editingExpense = page?.data.find((e) => e.expenseId === editingExpenseId);

    const [description, setDescription] = useState("");
    const [amount, setAmount] = useState("");
    const [date, setDate] = useState(toDateInputValue(Date.now()));
    const [category, setCategory] = useState<string | null>(null);

    useEffect(() => {
        if (editingExpense) {
            setDescription(editingExpense.description);
            setAmount(String(editingExpense.amount));
            setDate(toDateInputValue(editingExpense.date));
            setCategory(editingExpense.category ?? null);
        } else {
            setDescription("");
            setAmount("");
            setDate(toDateInputValue(Date.now()));
            setCategory(null);
        }
    }, [editingExpense]);

    const createExpense = useCreateExpense();
    const updateExpense = useUpdateExpense();
    const { scheduleDelete } = useSoftDeleteExpense();

    const isSaving = createExpense.isPending || updateExpense.isPending;

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!description.trim() || !amount) return;

        const payload = {
            description: description.trim(),
            amount: Number(amount),
            date: new Date(date).getTime(),
            category: category ?? undefined,
        };

        if (editingExpense) {
            await updateExpense.mutateAsync({ expenseId: editingExpense.expenseId, updates: payload });
        } else {
            await createExpense.mutateAsync(payload);
        }
        closeAddSheet();
    }

    function handleDelete() {
        if (!editingExpense) return;
        scheduleDelete(editingExpense);
        closeAddSheet();
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Description</label>
                <input
                    autoFocus
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="e.g. Groceries at DMart"
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 px-3.5 py-3 text-base focus:border-brand-500 dark:focus:border-teal-400 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:focus:ring-teal-400"
                />
            </div>

            <div className="flex gap-3">
                <div className="flex-1">
                    <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Amount (₹)</label>
                    <input
                        type="number"
                        inputMode="decimal"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0"
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 px-3.5 py-3 text-base focus:border-brand-500 dark:focus:border-teal-400 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:focus:ring-teal-400"
                    />
                </div>
                <div className="flex-1">
                    <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Date</label>
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 px-3.5 py-3 text-base focus:border-brand-500 dark:focus:border-teal-400 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:focus:ring-teal-400"
                    />
                </div>
            </div>

            <div>
                <label className="mb-1 block px-1 text-xs font-medium text-slate-500 dark:text-slate-400">Category</label>
                <CategoryPicker value={category} onChange={setCategory} />
            </div>

            <div className="flex gap-3 pt-2">
                {editingExpense && (
                    <Button type="button" variant="danger" className="flex-1" onClick={handleDelete}>
                        Delete
                    </Button>
                )}
                <Button type="submit" className="flex-1" disabled={isSaving}>
                    {isSaving ? "Saving…" : editingExpense ? "Save Changes" : "Add Expense"}
                </Button>
            </div>
        </form>
    );
}
