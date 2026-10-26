import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { kvDel, kvGet, kvSet } from "./db";

/** Persists the React Query cache in IndexedDB so the UI paints before the server wakes. */
export const idbPersister = createAsyncStoragePersister({
    key: "rq-cache",
    throttleTime: 1000,
    storage: {
        getItem: async (key) => (await kvGet<string>(key)) ?? null,
        setItem: (key, value) => kvSet(key, value),
        removeItem: (key) => kvDel(key),
    },
});
