/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: "#2563eb",
        secondary: "#4b5563",
        accent: "#f59e0b",
        background: "#f9fafb",
        surface: "#ffffff",
        success: "#10b981",
        warning: "#facc15",
        danger: "#ef4444"
      }
    }
  },
  plugins: []
};