import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import { idbPersister } from "./offline/queryPersister";

const CACHE_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 7;

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 30_000,
            gcTime: CACHE_MAX_AGE_MS, // must be >= the persister maxAge
            refetchOnWindowFocus: false,
            networkMode: "offlineFirst",
            retry: 3,
            retryDelay: (attempt) => Math.min(2000 * 2 ** attempt, 15_000), // rides out the Render cold start
        },
    },
});

// Fire-and-forget wake-up for Render; cached data renders meanwhile.
fetch(`${import.meta.env.VITE_API_BASE_URL}/health`, { mode: "no-cors", keepalive: true }).catch(() => undefined);

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <PersistQueryClientProvider
            client={queryClient}
            persistOptions={{ persister: idbPersister, maxAge: CACHE_MAX_AGE_MS, buster: "v1" }}
        >
            <BrowserRouter>
                <App />
            </BrowserRouter>
        </PersistQueryClientProvider>
    </React.StrictMode>
);
