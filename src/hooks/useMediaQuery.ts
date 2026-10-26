import { useSyncExternalStore } from "react";

/** Subscribes to a CSS media query; returns false during SSR/unsupported environments. */
export function useMediaQuery(query: string): boolean {
    const supported = typeof window !== "undefined" && typeof window.matchMedia === "function";
    return useSyncExternalStore(
        (notify) => {
            if (!supported) return () => {};
            const mql = window.matchMedia(query);
            mql.addEventListener("change", notify);
            return () => mql.removeEventListener("change", notify);
        },
        () => (supported ? window.matchMedia(query).matches : false),
        () => false
    );
}
