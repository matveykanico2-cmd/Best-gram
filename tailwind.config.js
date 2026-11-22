/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#07111f",
        primary: "#38e3c1",
        border: "#20344b",
        secondary: "#91a8bb",
        hover: "#12263a",
      },
    },
  },
  plugins: [],
}
