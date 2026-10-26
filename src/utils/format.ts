export function money(value: number): string {
    return "₹" + Math.abs(value).toLocaleString("en-IN", { maximumFractionDigits: 0 });
}

export function signedMoney(value: number): string {
    const sign = value >= 0 ? "+" : "-";
    return `${sign}₹${Math.abs(value).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}

export function formatDate(dateMillis: number): string {
    return new Date(dateMillis).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

export function formatDayLabel(dateMillis: number): string {
    return new Date(dateMillis).toLocaleDateString("en-IN", {
        weekday: "short",
        day: "2-digit",
        month: "short",
    });
}

export function monthKeyToLabel(monthKey: string): string {
    const year = Number(monthKey.slice(0, 4));
    const month = Number(monthKey.slice(4, 6)) - 1;
    return new Date(year, month, 1).toLocaleDateString("en-IN", {
        month: "short",
        year: "numeric",
    });
}

/** Groups a flat, date-sorted expense list into { "Fri, 12 Jun": [...] } buckets for list rendering. */
export function groupByDay<T extends { date: number }>(items: T[]): Record<string, T[]> {
    return items.reduce((acc, item) => {
        const key = formatDayLabel(item.date);
        (acc[key] ??= []).push(item);
        return acc;
    }, {} as Record<string, T[]>);
}
