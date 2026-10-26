import { useUIStore } from "../../store/uiStore";

/**
 * Floating action button anchored to the bottom-right of the content
 * column (hidden on desktop, where SideNav owns the action). The wrapper
 * mirrors MobileShell's column width so the
 * button stays glued to the app column instead of the viewport edge on desktop,
 * and is pointer-transparent so it never swallows taps on the content beneath.
 */
export function FloatingAddButton() {
    const openAddSheet = useUIStore((s) => s.openAddSheet);

    return (
        <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 mx-auto max-w-md md:max-w-3xl lg:hidden">
            <button
                type="button"
                onClick={openAddSheet}
                aria-label="Add expense"
                className="pointer-events-auto absolute bottom-[calc(env(safe-area-inset-bottom)+5rem)] right-4 md:right-6 grid h-14 w-14 place-items-center rounded-full bg-brand-500 dark:bg-teal-700 text-white shadow-hero transition-transform active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:focus-visible:ring-teal-400 focus-visible:ring-offset-2"
            >
                <svg
                    viewBox="0 0 24 24"
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2.5}
                    strokeLinecap="round"
                    aria-hidden="true"
                >
                    <path d="M12 5v14M5 12h14" />
                </svg>
            </button>
        </div>
    );
}
