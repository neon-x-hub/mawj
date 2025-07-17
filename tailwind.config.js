const { heroui } = require("@heroui/react");


/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {},
    },
    darkMode: 'class',
    plugins: [heroui({
        themes: {
            light: {
                colors: {
                    primary: "#397fa3",   // 👉 Your new primary color
                    secondary: "#EE457E", // optional: override more
                    background: "#F4E8D1",
                    danger: "#e43350"
                }
            },
            dark: {
                colors: {
                    primary: "#397fa3",
                    secondary: "#EE457E",
                    background: "#E1CA9E"
                }
            }
        }
    })],
}
