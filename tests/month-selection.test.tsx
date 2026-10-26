// @vitest-environment jsdom
import { cloneElement, type ReactElement } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import DashboardPage from "../src/pages/DashboardPage";
import { apiClient } from "../src/api/client";

vi.mock("recharts", async (importOriginal) => ({
    ...await importOriginal<typeof import("recharts")>(),
    ResponsiveContainer: ({ children }: { children: ReactElement }) =>
        cloneElement(children, { width: 600, height: 176 }),
}));

const apiURL = "http://localhost/api";
const summary = {
    expenseTotal: 900,
    topTags: [{ name: "Current category", total: 900, color: "#134E5E" }],
};
const server = setupServer(
    http.get(`${apiURL}/dashboard/summary`, ({ request }) => {
        const monthKey = new URL(request.url).searchParams.get("monthKey");
        return HttpResponse.json(monthKey ? {
            expenseTotal: 250,
            topTags: [{ name: "Historical category", total: 250, color: "#134E5E" }],
        } : summary);
    }),
    http.get(`${apiURL}/dashboard/trend`, () => HttpResponse.json([
        { monthKey: "202601", label: "Jan 2026", total: 250 },
        { monthKey: "202602", label: "Feb 2026", total: 0 },
    ]))
);

beforeAll(() => {
    apiClient.defaults.baseURL = apiURL;
    server.listen({ onUnhandledRequest: "error" });
});
afterEach(() => { cleanup(); server.resetHandlers(); });
afterAll(() => server.close());

function renderDashboard() {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(<QueryClientProvider client={client}><DashboardPage /></QueryClientProvider>);
}

async function selectJanuary() {
    const bar = await screen.findByRole("button", { name: "Show categories for Jan 2026" });
    fireEvent.click(bar);
    return bar;
}

describe("trend month selection", () => {
    it("should load selected month categories while preserving the current month hero", async () => {
        renderDashboard();
        await screen.findByText(/Current category/);
        const bar = await selectJanuary();
        await screen.findByText(/Historical category/);
        expect(bar.getAttribute("aria-pressed")).toBe("true");
        const section = screen.getByText("Top Categories").closest("section")!;
        expect(within(section).getByText("Jan 2026")).toBeTruthy();
        expect(within(section).queryByText(/Current category/)).toBeNull();
        expect(screen.getByText("This Month").parentElement?.textContent).toContain("900");
        expect(section.textContent).toContain("250");
    });

    it("should allow keyboard selection and return to the current month", async () => {
        renderDashboard();
        const bar = await screen.findByRole("button", { name: "Show categories for Jan 2026" });
        fireEvent.keyDown(bar, { key: "Enter" });
        await screen.findByText(/Historical category/);
        fireEvent.click(screen.getByRole("button", { name: "This month" }));
        await screen.findByText(/Current category/);
        expect(screen.queryByText(/Historical category/)).toBeNull();
    });

    it("should show a selected-month empty state rather than current month values", async () => {
        server.use(http.get(`${apiURL}/dashboard/summary`, ({ request }) =>
            HttpResponse.json(new URL(request.url).searchParams.has("monthKey")
                ? { expenseTotal: 0, topTags: [] } : summary)
        ));
        renderDashboard();
        await selectJanuary();
        await screen.findByText("No spending in Jan 2026");
        expect(screen.queryByText(/Current category/)).toBeNull();
    });

    it("should show loading and an explicit error instead of stale categories", async () => {
        let failRequest: (() => void) | undefined;
        server.use(http.get(`${apiURL}/dashboard/summary`, async ({ request }) => {
            if (!new URL(request.url).searchParams.has("monthKey")) return HttpResponse.json(summary);
            await new Promise<void>((resolve) => { failRequest = resolve; });
            return HttpResponse.json({ error: "Month unavailable" }, { status: 500 });
        }));
        renderDashboard();
        await selectJanuary();
        await screen.findByText("Loading categories…");
        expect(screen.queryByText(/Current category/)).toBeNull();
        await waitFor(() => expect(failRequest).toBeTypeOf("function"));
        failRequest!();
        await screen.findByText("Couldn't load categories for Jan 2026.");
    });
});
