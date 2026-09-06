/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef7ff",
          100: "#d9edff",
          200: "#b9ddff",
          300: "#8ac7ff",
          400: "#55a8ff",
          500: "#2f86eb",
          600: "#1769c2",
          700: "#15569e",
          800: "#174a80",
          900: "#193f6b"
        },
        ink: "#0f172a",
        mint: "#0f9f8f",
        coral: "#f97316"
      },
      boxShadow: {
        soft: "0 18px 50px rgba(15, 23, 42, 0.08)"
      }
    }
  },
  plugins: []
};
