import { useState } from "react";

export interface ExpenseDateRange {
    startDate: string;
    endDate: string;
}

export function toExpenseDateParams(range: ExpenseDateRange) {
    return {
        startDate: range.startDate ? new Date(`${range.startDate}T00:00:00`).toISOString() : undefined,
        endDate: range.endDate ? new Date(`${range.endDate}T23:59:59.999`).toISOString() : undefined,
    };
}

const MONTHS = Array.from({ length: 12 }, (_, month) =>
    new Date(2000, month, 1).toLocaleDateString("en-IN", { month: "short" })
);

export function ExpenseDateFilter({ onApply }: { onApply: (range: ExpenseDateRange) => void }) {
    const [open, setOpen] = useState(false);
    const [range, setRange] = useState<ExpenseDateRange>({ startDate: "", endDate: "" });
    const [year, setYear] = useState(String(new Date().getFullYear()));
    const [active, setActive] = useState(false);
    const invalid = !!(range.startDate && range.endDate && range.startDate > range.endDate);

    function selectMonth(month: number) {
        const lastDay = new Date(Number(year), month + 1, 0).getDate();
        const prefix = `${year}-${String(month + 1).padStart(2, "0")}`;
        setRange({ startDate: `${prefix}-01`, endDate: `${prefix}-${lastDay}` });
    }

    function apply(next: ExpenseDateRange) {
        setRange(next);
        onApply(next);
        setActive(!!(next.startDate || next.endDate));
        setOpen(false);
    }

    return (
        <div>
            <button
                type="button"
                aria-expanded={open}
                aria-controls="expense-date-filters"
                onClick={() => setOpen(!open)}
                className="rounded-xl bg-brand-500 dark:bg-teal-700 px-4 py-2 text-sm font-medium text-white"
            >
                Filter{active ? " (active)" : ""}
            </button>
            {open && (
                <form
                    id="expense-date-filters"
                    aria-label="Expense date filters"
                    className="mt-3 space-y-4 glass rounded-2xl p-4"
                    onSubmit={(event) => {
                        event.preventDefault();
                        if (!invalid) apply(range);
                    }}
                >
                    <div className="grid gap-3 md:grid-cols-2">
                        <label className="text-sm text-slate-700 dark:text-slate-200">
                            Start date
                            <input type="date" value={range.startDate}
                                onChange={(event) => setRange({ ...range, startDate: event.target.value })}
                                className="mt-1 block w-full min-w-0 rounded-lg border border-slate-200 dark:border-slate-700 p-2" />
                        </label>
                        <label className="text-sm text-slate-700 dark:text-slate-200">
                            End date
                            <input type="date" value={range.endDate}
                                onChange={(event) => setRange({ ...range, endDate: event.target.value })}
                                className="mt-1 block w-full min-w-0 rounded-lg border border-slate-200 dark:border-slate-700 p-2" />
                        </label>
                    </div>
                    {invalid && <p role="alert" className="text-sm text-red-600 dark:text-red-300">End date must be on or after start date.</p>}
                    <label className="block text-sm text-slate-700 dark:text-slate-200">
                        Preset year
                        <input type="number" min="1000" max="9999" step="1" required
                            value={year} onChange={(event) => setYear(event.target.value)}
                            className="ml-3 w-24 rounded-lg border border-slate-200 dark:border-slate-700 p-2" />
                    </label>
                    <div className="grid grid-cols-3 gap-2 md:grid-cols-6" aria-label="Month presets">
                        {MONTHS.map((month, index) => (
                            <button key={month} type="button"
                                disabled={!/^[1-9]\d{3}$/.test(year)}
                                onClick={() => selectMonth(index)}
                                className="rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm hover:bg-brand-50 dark:hover:bg-teal-900/40 disabled:opacity-50"
                            >{month}</button>
                        ))}
                    </div>
                    <div className="flex gap-3">
                        <button type="submit" disabled={invalid}
                            className="rounded-lg bg-brand-500 dark:bg-teal-700 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                        >Apply filters</button>
                        <button type="button" onClick={() => apply({ startDate: "", endDate: "" })}
                            className="rounded-lg px-4 py-2 text-sm text-slate-600 dark:text-slate-300"
                        >Clear dates</button>
                    </div>
                </form>
            )}
        </div>
    );
}
