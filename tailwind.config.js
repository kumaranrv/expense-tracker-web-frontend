/** @type {import('tailwindcss').Config} */
export default {
    darkMode: "media",
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
        extend: {
            colors: {
                brand: {
                    50: "#e6f4f1",
                    100: "#c0e3db",
                    500: "#134E5E",
                    600: "#0f3f4c",
                    700: "#0b2f39",
                },
            },
            fontFamily: {
                sans: ["Inter", "system-ui", "sans-serif"],
            },
            boxShadow: {
                card: "0 2px 12px rgba(15, 23, 42, 0.06)",
                hero: "0 10px 30px -8px rgba(19, 78, 94, 0.45)",
            },
        },
    },
    plugins: [],
};
