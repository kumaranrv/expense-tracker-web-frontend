import { createRequire } from "node:module";
import { createServer, type Server } from "node:http";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { dashboardRouter } from "../../backend/src/routes/dashboard";
import { MonthlyExpenseDoc } from "../../backend/src/models/MonthlyExpenseDoc";
import { currentMonthRange } from "../../backend/src/utils/monthKey";

vi.mock("../../backend/src/models/MonthlyExpenseDoc", () => ({
    MonthlyExpenseDoc: { aggregate: vi.fn() },
    UNWIND_EXPENSES: [{ $unwind: "$expenses" }],
}));
vi.mock("../../backend/src/models/Settings", () => ({
    getOrCreateSettings: vi.fn(async () => ({ monthlyBudget: 1000 })),
}));

// @ts-ignore
const require = createRequire(new URL("../../backend/package.json", import.meta.url));
const express = require("express");
let server: Server;
let baseURL: string;

beforeAll(async () => {
    const app = express();
    app.use("/dashboard", dashboardRouter);
    server = createServer(app);
    await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
    const address = server.address();
    if (!address || typeof address === "string") throw new Error("Missing test server address");
    baseURL = `http://127.0.0.1:${address.port}/dashboard/summary`;
});
afterAll(() => new Promise<void>((resolve, reject) =>
    server.close((error) => error ? reject(error) : resolve())
));
beforeEach(() => vi.mocked(MonthlyExpenseDoc.aggregate).mockReset());

describe("dashboard summary month filtering", () => {
    it("should use the selected calendar month including its final millisecond", async () => {
        vi.mocked(MonthlyExpenseDoc.aggregate).mockResolvedValue([{ _id: "Food", total: 250 }]);
        const response = await fetch(`${baseURL}?monthKey=202402`);
        expect(response.status).toBe(200);
        expect(MonthlyExpenseDoc.aggregate).toHaveBeenCalledWith(expect.arrayContaining([
            { $match: { "expenses.date": {
                $gte: new Date(2024, 1, 1).getTime(),
                $lte: new Date(2024, 2, 1).getTime() - 1,
            } } },
        ]));
        expect(await response.json()).toMatchObject({
            expenseTotal: 250,
            topTags: [{ total: 250 }],
        });
    });

    it("should preserve the current month default", async () => {
        vi.mocked(MonthlyExpenseDoc.aggregate).mockResolvedValue([]);
        await fetch(baseURL);
        const { start, end } = currentMonthRange();
        expect(MonthlyExpenseDoc.aggregate).toHaveBeenCalledWith(expect.arrayContaining([
            { $match: { "expenses.date": { $gte: start, $lte: end } } },
        ]));
    });

    it.each(["202413", "202400", "20241", "", "202401&monthKey=202402"])(
        "should reject invalid or repeated monthKey %s before querying",
        async (monthKey) => {
            const response = await fetch(`${baseURL}?monthKey=${monthKey}`);
            expect(response.status).toBe(400);
            expect(await response.json()).toEqual({ error: "monthKey must be in yyyyMM format" });
            expect(MonthlyExpenseDoc.aggregate).not.toHaveBeenCalled();
        }
    );

    it("should return an empty breakdown for a month without spending", async () => {
        vi.mocked(MonthlyExpenseDoc.aggregate).mockResolvedValue([]);
        const response = await fetch(`${baseURL}?monthKey=202401`);
        expect(await response.json()).toMatchObject({ expenseTotal: 0, topTags: [] });
    });
});
