import { useCallback, useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { flush, getLastSyncAt, getPendingCount, subscribe } from "./syncEngine";
import { requestPersistentStorage } from "./db";

const TICK_MS = 60_000;

/**
 * iOS freezes JS when the screen locks, so a timer alone cannot hit 11 PM.
 * Instead we re-check "is a sync due?" on every moment the app comes alive.
 */
export function useSyncLifecycle() {
    const qc = useQueryClient();
    const [pending, setPending] = useState(0);
    const [lastSyncAt, setLastSyncAt] = useState(0);
    const [syncing, setSyncing] = useState(false);

    const refresh = useCallback(async () => {
        setPending(await getPendingCount());
        setLastSyncAt(await getLastSyncAt());
    }, []);

    const syncNow = useCallback(
        async (force: boolean) => {
            setSyncing(true);
            try {
                await flush(qc, { force });
            } finally {
                setSyncing(false);
                void refresh();
            }
        },
        [qc, refresh]
    );

    useEffect(() => {
        void requestPersistentStorage();
        void refresh();
        void syncNow(false);

        const onVisible = () => {
            if (document.visibilityState === "visible") void syncNow(false);
        };
        const onFocus = () => void syncNow(false);
        const onPageShow = (e: PageTransitionEvent) => {
            if (e.persisted) void syncNow(false);
        };
        const onOnline = () => void syncNow(false);

        document.addEventListener("visibilitychange", onVisible);
        window.addEventListener("focus", onFocus);
        window.addEventListener("pageshow", onPageShow);
        window.addEventListener("online", onOnline);
        const tick = window.setInterval(onVisible, TICK_MS); // only runs while foregrounded
        const unsubscribe = subscribe(() => void refresh());

        return () => {
            document.removeEventListener("visibilitychange", onVisible);
            window.removeEventListener("focus", onFocus);
            window.removeEventListener("pageshow", onPageShow);
            window.removeEventListener("online", onOnline);
            window.clearInterval(tick);
            unsubscribe();
        };
    }, [refresh, syncNow]);

    return { pending, lastSyncAt, syncing, syncNow: () => syncNow(true) };
}
