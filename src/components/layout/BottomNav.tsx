import { NavLink } from "react-router-dom";
import clsx from "clsx";

import { NAV_ITEMS } from "./navItems";

export function BottomNav() {
    return (
        <nav className="fixed inset-x-0 bottom-0 z-30 mx-auto grid max-w-md grid-cols-3 md:max-w-3xl lg:hidden glass glass-strong border-x-0 border-b-0 px-2 pb-[env(safe-area-inset-bottom)] pt-2">
            {NAV_ITEMS.map((item) => (
                <NavItem key={item.to} {...item} />
            ))}
        </nav>
    );
}

function NavItem({ to, label, icon }: { to: string; label: string; icon: string }) {
    return (
        <NavLink
            to={to}
            className={({ isActive }) =>
                clsx(
                    "flex flex-col items-center justify-center gap-0.5 py-1 text-xs font-medium",
                    isActive ? "text-brand-500 dark:text-teal-300" : "text-slate-400"
                )
            }
        >
            <span className="text-lg leading-none">{icon}</span>
            {label}
        </NavLink>
    );
}
