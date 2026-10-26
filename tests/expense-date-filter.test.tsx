// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ExpenseDateFilter, toExpenseDateParams } from "../src/components/expenses/ExpenseDateFilter";

afterEach(cleanup);

function openFilter() {
    const onApply = vi.fn();
    render(<ExpenseDateFilter onApply={onApply} />);
    expect(screen.queryByLabelText("Start date")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Filter" }));
    return onApply;
}

describe("expense date filters", () => {
    it("should reveal custom dates and twelve month presets", () => {
        openFilter();
        expect(screen.getByRole("button", { name: "Filter" }).getAttribute("aria-expanded")).toBe("true");
        expect(screen.getByLabelText("Month presets").querySelectorAll("button")).toHaveLength(12);
        expect(screen.getByLabelText("End date")).toBeTruthy();
    });

    it("should select a full leap-year month and apply only on confirmation", () => {
        const onApply = openFilter();
        fireEvent.change(screen.getByLabelText("Preset year"), { target: { value: "2024" } });
        fireEvent.click(screen.getByRole("button", { name: "Feb" }));
        expect(onApply).not.toHaveBeenCalled();
        fireEvent.click(screen.getByRole("button", { name: "Apply filters" }));
        expect(onApply).toHaveBeenCalledWith({ startDate: "2024-02-01", endDate: "2024-02-29" });
        expect(screen.getByRole("button", { name: "Filter (active)" })).toBeTruthy();
        expect(screen.queryByLabelText("Start date")).toBeNull();
    });

    it("should reject reversed dates and clear an applied range", () => {
        const onApply = openFilter();
        fireEvent.change(screen.getByLabelText("Start date"), { target: { value: "2026-10-20" } });
        fireEvent.change(screen.getByLabelText("End date"), { target: { value: "2026-10-01" } });
        expect(screen.getByRole("alert").textContent).toContain("End date must");
        expect(screen.getByRole("button", { name: "Apply filters" }).hasAttribute("disabled")).toBe(true);
        fireEvent.click(screen.getByRole("button", { name: "Clear dates" }));
        expect(onApply).toHaveBeenCalledWith({ startDate: "", endDate: "" });
    });

    it("should convert local date bounds to inclusive timestamps for server and outbox filtering", () => {
        const params = toExpenseDateParams({ startDate: "2024-02-01", endDate: "2024-02-29" });
        expect(Date.parse(params.startDate!)).toBe(new Date(2024, 1, 1).getTime());
        expect(Date.parse(params.endDate!)).toBe(new Date(2024, 2, 1).getTime() - 1);
        expect(toExpenseDateParams({ startDate: "", endDate: "" })).toEqual({
            startDate: undefined, endDate: undefined,
        });
    });
});
