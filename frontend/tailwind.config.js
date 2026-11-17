/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        blush: {
          50: "#fdf6f4",
          100: "#fbeae5",
          200: "#f7d4cb",
          300: "#f0b4a4",
          400: "#e68b74",
          500: "#d96b52",
          600: "#c5523b",
          700: "#a44230",
          800: "#873a2c",
          900: "#703429",
        },
        nude: {
          50: "#faf7f3",
          100: "#f2ebe1",
          200: "#e6d5c1",
          300: "#d8b99a",
          400: "#ca9a74",
          500: "#be845a",
          600: "#b0734d",
          700: "#935b41",
          800: "#784b3a",
          900: "#623f31",
        },
        cream: "#faf7f2",
        ink: "#2b2422",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        serif: ["Playfair Display", "Georgia", "serif"],
      },
    },
  },
  plugins: [],
};