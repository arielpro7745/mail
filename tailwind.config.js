/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",          // ← ➊
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: { sans: ['"Inter"', "sans-serif"] },
      transitionProperty: { width: "width" },
    },
  },
  plugins: [],
};
