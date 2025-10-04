/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#9b6764",
          50: "#faf7ef",
          100: "#f5f0e2",
          200: "#ece2df",
          300: "#ddc8c4",
          400: "#c9a8a3",
          500: "#b38580",
          600: "#9b6764",
          700: "#805150",
          800: "#6c4545",
          900: "#5e3d3e",
          950: "#321f1f",
        },
        secondary: {
          DEFAULT: "#64989b",
          50: "#f4f9f9",
          100: "#dcebeb",
          200: "#b8d7d7",
          300: "#8dbabb",
          400: "#64989b",
          500: "#4b7d81",
          600: "#3a6367",
          700: "#324f53",
          800: "#2b4144",
          900: "#27383a",
          950: "#121f21",
        },
      },
    },
  },
  plugins: [],
};
