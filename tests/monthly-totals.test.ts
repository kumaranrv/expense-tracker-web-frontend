import { createRequire } from "node:module";
import { createServer, type Server } from "node:http";
import "mingo/init/system";
import { aggregate } from "mingo";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { dashboardRouter } from "../../backend/src/routes/dashboard";
import { MonthlyExpenseDoc } from "../../backend/src/models/MonthlyExpenseDoc";
import { lastNMonthKeys } from "../../backend/src/utils/monthKey";

vi.mock("../../backend/src/models/MonthlyExpenseDoc", async (importOriginal) => ({
    ...await importOriginal<typeof import("../../backend/src/models/MonthlyExpenseDoc")>(),
    MonthlyExpenseDoc: { aggregate: vi.fn() },
}));
vi.mock("../../backend/src/models/Settings", () => ({
    getOrCreateSettings: vi.fn(async () => ({ monthlyBudget: null })),
}));

const require = createRequire(new URL("../../backend/package.json", import.meta.url));
const express = require("express");
let server: Server;
let baseURL: string;
const keys = lastNMonthKeys(6);
const monthDate = (key: string) => new Date(Number(key.slice(0, 4)), Number(key.slice(4)) - 1, 1);
const first = monthDate(keys[0]).getTime();
const second = monthDate(keys[1]).getTime();

const documents = [
    { _id: keys[0], expenses: [
        { date: second, amount: 200, category: "Food" },
        { date: second - 1, amount: 10.25, category: "Food" },
    ] },
    { _id: keys[1], expenses: [
        { date: first, amount: 30.5, category: "Food" },
    ] },
    { _id: "199901", expenses: [
        { date: first + 1000, amount: 9.25, category: "Food" },
        { date: first - 1, amount: 999, category: "Food" },
        [{ date: first, amount: 5000 }],
    ] },
];

beforeAll(async () => {
    const app = express();
    app.use("/dashboard", dashboardRouter);
    server = createServer(app);
    await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
    const address = server.address();
    if (!address || typeof address === "string") throw new Error("Missing test server address");
    baseURL = `http://127.0.0.1:${address.port}/dashboard`;
});
afterAll(() => new Promise<void>((resolve, reject) =>
    server.close((error) => error ? reject(error) : resolve())
));
beforeEach(() => {
    vi.mocked(MonthlyExpenseDoc.aggregate).mockImplementation(async (pipeline) =>
        aggregate(documents, pipeline!)
    );
});

describe("monthly totals calculated from expense dates", () => {
    it("should match each selected-month summary regardless of the storage bucket", async () => {
        const trend = await (await fetch(`${baseURL}/trend`)).json();
        expect(trend).toHaveLength(6);
        expect(trend.map((point: { monthKey: string }) => point.monthKey)).toEqual(keys);
        expect(trend.map((point: { total: number }) => point.total)).toEqual([50, 200, 0, 0, 0, 0]);
        for (const point of trend) {
            const summary = await (await fetch(`${baseURL}/summary?monthKey=${point.monthKey}`)).json();
            expect(point.total).toBe(summary.expenseTotal);
        }
    });

    it("should calculate monthly overview with the same dates and preserve descending order", async () => {
        const overview = await (await fetch(`${baseURL}/monthly-overview`)).json();
        expect(overview.slice(0, 2)).toEqual([
            expect.objectContaining({ monthKey: keys[1], total: 200 }),
            expect.objectContaining({ monthKey: keys[0], total: 50 }),
        ]);
        expect(overview[2].total).toBe(999);
    });
});
