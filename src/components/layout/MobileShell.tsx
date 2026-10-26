import { ReactNode } from "react";
import { BottomNav } from "./BottomNav";
import { FloatingAddButton } from "./FloatingAddButton";
import { SideNav } from "./SideNav";
import { SyncBanner } from "./SyncBanner";
import { UndoSnackbar } from "../expenses/UndoSnackbar";

/**
 * Responsive app shell.
 * - < 768px: phone-width column with fixed bottom nav + FAB.
 * - 768-1023px: wider centered column (max-w-3xl), same bottom nav.
 * - >= 1024px: persistent sidebar + fluid content area capped for readability.
 */
export function MobileShell({ children }: { children: ReactNode }) {
    return (
        <div className="min-h-screen lg:grid lg:grid-cols-[clamp(14rem,16vw,17rem)_minmax(0,1fr)] lg:bg-rupee-pattern">
            <SideNav />
            <div className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-rupee-pattern shadow-xl md:max-w-3xl lg:max-w-none lg:shadow-none">
                <SyncBanner />
                <main className="mx-auto w-full flex-1 pb-24 lg:max-w-[90rem] lg:pb-10">{children}</main>
                <UndoSnackbar />
                <FloatingAddButton />
                <BottomNav />
            </div>
        </div>
    );
}
