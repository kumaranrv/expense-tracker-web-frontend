import { v4 as uuid } from "uuid";
import type { QueryClient } from "@tanstack/react-query";
import { apiClient } from "@/api/client";
import { getDb, getOutbox, kvGet, kvSet, type MutationType, type OutboxOp } from "./db";
import { isSyncDue } from "./istSchedule";
import { patchCache } from "./overlay";

const LAST_SYNC_KEY = "lastSuccessfulSyncAt";
const LOCK_NAME = "expense-sync";
const CHUNK_SIZE = 200;

export type FlushResult = "synced" | "skipped" | "failed";

const listeners = new Set<() => void>();
let flushing = false;

export function subscribe(fn: () => void): () => void {
    listeners.add(fn);
    return () => void listeners.delete(fn);
}

const notify = () => listeners.forEach((fn) => fn());

export const getPendingCount = async (): Promise<number> => (await getDb()).count("outbox");
export const getLastSyncAt = async (): Promise<number> => (await kvGet<number>(LAST_SYNC_KEY)) ?? 0;

/** Queues a mutation durably, then reflects it in the cached lists. */
export async function recordMutation(
    qc: QueryClient,
    type: MutationType,
    expenseId: string,
    payload?: OutboxOp["payload"]
): Promise<void> {
    const op: OutboxOp = { opId: uuid(), type, expenseId, payload, clientTs: Date.now() };
    await (await getDb()).add("outbox", op);
    patchCache(qc, [op]);
    notify();
}

/** Collapses ops per expense: create+update => create, create+delete => nothing, delete => delete. */
function compact(ops: OutboxOp[]): { keep: OutboxOp[]; drop: OutboxOp[] } {
    const byExpense = new Map<string, OutboxOp[]>();
    ops.forEach((op) => byExpense.set(op.expenseId, [...(byExpense.get(op.expenseId) ?? []), op]));

    const keep: OutboxOp[] = [];
    byExpense.forEach((list) => {
        const first = list[0];
        const last = list[list.length - 1];
        if (first.type === "create" && last.type === "delete") return;
        keep.push(last);
    });
    const keptIds = new Set(keep.map((k) => k.opId));
    return { keep, drop: ops.filter((o) => !keptIds.has(o.opId)) };
}

async function postChunks(ops: OutboxOp[]): Promise<Set<string>> {
    const acked = new Set<string>();
    for (let i = 0; i < ops.length; i += CHUNK_SIZE) {
        const chunk = ops.slice(i, i + CHUNK_SIZE).map(({ opId, type, expenseId, payload, clientTs }) => ({
            opId,
            type,
            expenseId,
            payload,
            clientTs,
        }));
        const { data } = await apiClient.post<{ ackedOpIds: string[] }>(
            "/v1/transactions/sync",
            { ops: chunk },
            { timeout: 120_000 } // tolerates a backend cold start
        );
        data.ackedOpIds.forEach((id) => acked.add(id));
    }
    return acked;
}

async function syncOutbox(qc: QueryClient): Promise<FlushResult> {
    const ops = await getOutbox();
    if (ops.length === 0) {
        await kvSet(LAST_SYNC_KEY, Date.now());
        return "skipped";
    }

    const { keep, drop } = compact(ops);
    try {
        const acked = await postChunks(keep);
        const allAcked = keep.every((k) => acked.has(k.opId));
        const db = await getDb();
        const tx = db.transaction("outbox", "readwrite");
        const removable = [...keep.filter((k) => acked.has(k.opId)), ...(allAcked ? drop : [])];
        await Promise.all(removable.map((o) => tx.store.delete(o.seq!)));
        await tx.done;

        if (allAcked) await kvSet(LAST_SYNC_KEY, Date.now());
        await qc.invalidateQueries();
        return allAcked ? "synced" : "failed";
    } catch {
        return "failed";
    }
}

/**
 * Flushes the outbox. Without `force` it only runs when the 11 PM IST sync is
 * due. Guarded in-process by a flag and across tabs by the Web Locks API.
 */
export async function flush(qc: QueryClient, opts: { force?: boolean } = {}): Promise<FlushResult> {
    if (flushing || !navigator.onLine) return "skipped";
    if (!opts.force && !isSyncDue(await getLastSyncAt())) return "skipped";

    flushing = true;
    try {
        if (!navigator.locks) return await syncOutbox(qc);
        return await navigator.locks.request(LOCK_NAME, { ifAvailable: true }, async (lock) =>
            lock ? syncOutbox(qc) : "skipped"
        );
    } finally {
        flushing = false;
        notify();
    }
}
