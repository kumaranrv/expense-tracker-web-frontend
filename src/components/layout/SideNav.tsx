import { NavLink } from "react-router-dom";
import clsx from "clsx";
import { NAV_ITEMS } from "./navItems";
import { useUIStore } from "../../store/uiStore";

/** Persistent desktop navigation; replaces BottomNav and the FAB from the `lg` breakpoint up. */
export function SideNav() {
    const openAddSheet = useUIStore((s) => s.openAddSheet);

    return (
        <aside className="sticky top-0 hidden h-screen flex-col gap-8 glass glass-strong border-y-0 border-l-0 px-4 py-8 lg:flex">
            <p className="px-3 text-xl font-bold tracking-tight text-brand-500 dark:text-teal-300">Expense Tracker</p>

            <nav aria-label="Primary" className="flex flex-col gap-1">
                {NAV_ITEMS.map(({ to, label, icon }) => (
                    <NavLink
                        key={to}
                        to={to}
                        end={to === "/"}
                        className={({ isActive }) =>
                            clsx(
                                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                                isActive
                                    ? "bg-brand-50 dark:bg-teal-900/40 text-brand-500 dark:text-teal-300"
                                    : "text-slate-500 dark:text-slate-400 hover:bg-white/70 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-slate-50"
                            )
                        }
                    >
                        <span aria-hidden="true" className="text-lg leading-none">{icon}</span>
                        {label}
                    </NavLink>
                ))}
            </nav>

            <button
                type="button"
                onClick={openAddSheet}
                className="mt-auto rounded-xl bg-brand-500 dark:bg-teal-700 px-4 py-3 text-sm font-semibold text-white shadow-hero transition-colors hover:bg-brand-600 dark:hover:bg-teal-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:focus-visible:ring-teal-400 focus-visible:ring-offset-2"
            >
                + Add expense
            </button>
        </aside>
    );
}
