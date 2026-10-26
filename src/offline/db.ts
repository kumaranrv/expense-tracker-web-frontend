import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import type { ExpenseEntry } from "@/types";

export type MutationType = "create" | "update" | "delete";

export interface OutboxOp {
    opId: string;
    seq?: number;
    type: MutationType;
    expenseId: string;
    payload?: Omit<ExpenseEntry, "expenseId">;
    clientTs: number;
}

interface ExpenseDB extends DBSchema {
    kv: { key: string; value: unknown };
    outbox: { key: number; value: OutboxOp; indexes: { byOpId: string } };
}

let dbPromise: Promise<IDBPDatabase<ExpenseDB>> | null = null;

export const getDb = () =>
    (dbPromise ??= openDB<ExpenseDB>("expense-tracker", 1, {
        upgrade(db) {
            db.createObjectStore("kv");
            const outbox = db.createObjectStore("outbox", { keyPath: "seq", autoIncrement: true });
            outbox.createIndex("byOpId", "opId", { unique: true });
        },
    }));

export async function kvGet<T>(key: string): Promise<T | undefined> {
    return (await (await getDb()).get("kv", key)) as T | undefined;
}

export async function kvSet(key: string, value: unknown): Promise<void> {
    await (await getDb()).put("kv", value, key);
}

export async function kvDel(key: string): Promise<void> {
    await (await getDb()).delete("kv", key);
}

export const getOutbox = async (): Promise<OutboxOp[]> => (await getDb()).getAll("outbox");

/** Asks Safari to exempt this origin from storage eviction (honored for installed PWAs). */
export async function requestPersistentStorage(): Promise<boolean> {
    if (!navigator.storage?.persist) return false;
    return (await navigator.storage.persisted()) || navigator.storage.persist();
}
