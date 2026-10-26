import { useMediaQuery } from "./useMediaQuery";

const LIGHT = {
    grid: "#e2e8f0", tick: "#64748b", cursor: "#f1f5f9", accent: "#134E5E", muted: "#a7c4c9",
    tooltip: { backgroundColor: "#ffffff", color: "#0f172a" },
};
const DARK = {
    grid: "#334155", tick: "#94a3b8", cursor: "#1e293b", accent: "#5eead4", muted: "#2f5560",
    tooltip: { backgroundColor: "#1e293b", color: "#f1f5f9" },
};

/** Chart colours that follow the browser's prefers-color-scheme. */
export function useChartTheme() {
    return useMediaQuery("(prefers-color-scheme: dark)") ? DARK : LIGHT;
}
