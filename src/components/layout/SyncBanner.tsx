import { useSyncLifecycle } from "../../offline/useSyncLifecycle";

/** Shows unsynced changes and lets the user force a flush; also owns the sync lifecycle listeners. */
export function SyncBanner() {
    const { pending, lastSyncAt, syncing, syncNow } = useSyncLifecycle();
    if (pending === 0 && !syncing) return null;

    return (
        <div className="sticky top-0 z-40 flex items-center justify-between gap-3 bg-amber-100 dark:bg-amber-900/40 px-4 py-2 text-sm md:px-6 lg:px-8 text-amber-900 dark:text-amber-100">
            <span>
                {pending} update{pending === 1 ? "" : "s"} waiting
                {lastSyncAt ? ` · last sync ${new Date(lastSyncAt).toLocaleString()}` : ""}
            </span>
            <button
                type="button"
                onClick={syncNow}
                disabled={syncing}
                className="rounded-full bg-amber-900 dark:bg-amber-700 px-4 py-1.5 font-medium text-white disabled:opacity-60"
            >
                {syncing ? "Syncing…" : "Sync Pending Updates"}
            </button>
        </div>
    );
}
