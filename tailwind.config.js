/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{ts,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                trello: {
                    blue: "#0052cc",
                    "blue-hover": "#0065ff",
                    "board-bg": "#0079bf",
                },
            },
        },
    },
    plugins: [],
};
