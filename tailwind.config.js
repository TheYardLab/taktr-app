/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: '#1A73E8', // 🔹 Replace with your primary brand color
        brandLight: '#E3F2FD', // 🔹 Light accent
      }
    },
  },
  plugins: [],
}