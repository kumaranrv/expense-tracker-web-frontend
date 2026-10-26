const IST_OFFSET_MS = 330 * 60_000; // IST is UTC+05:30 with no DST
const DAY_MS = 86_400_000;
const SYNC_HOUR_IST = 23;

/** Most recent 11:00 PM IST boundary at or before `now`, as epoch millis. */
export function lastSyncBoundary(now: number = Date.now()): number {
    const istMidnightUtcMs = Math.floor((now + IST_OFFSET_MS) / DAY_MS) * DAY_MS - IST_OFFSET_MS;
    const todayBoundary = istMidnightUtcMs + SYNC_HOUR_IST * 3_600_000;
    return now >= todayBoundary ? todayBoundary : todayBoundary - DAY_MS;
}

/** Due when the latest 11 PM IST has passed and no successful sync happened since. */
export function isSyncDue(lastSuccessfulSyncAt: number, now: number = Date.now()): boolean {
    return lastSuccessfulSyncAt < lastSyncBoundary(now);
}
