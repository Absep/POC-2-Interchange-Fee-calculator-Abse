/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        rail: {
          bg: "#030712",       // Obsidian Black MANDATORY 
          surface: "#0B1117",  // Deep Navy Grey 
          border: "#1F2937",   // Slate-800 
          cyan: "#38BDF8",     // Electric Cyan MANDATORY 
          indigo: "#818CF8",   // Indigo 
        },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
}