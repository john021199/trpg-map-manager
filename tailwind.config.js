/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'core-node': '#3b82f6',
        'outer-node': '#8b5cf6',
      }
    },
  },
  plugins: [],
}
