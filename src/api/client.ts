import axios from "axios";

export const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: {
        "x-api-key": import.meta.env.VITE_API_KEY,
        "Content-Type": "application/json",
    },
    timeout: 120_000, // tolerates a backend cold start
});

// Central error normalization so hooks/components can rely on `error.message`
apiClient.interceptors.response.use(
    (res) => res,
    (error) => {
        const message =
            error?.response?.data?.error ||
            error?.message ||
            "Something went wrong talking to the server";
        return Promise.reject(new Error(message));
    }
);
