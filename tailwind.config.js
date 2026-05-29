/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta infantil alegre para Alfafa (elefantinho)
        primary: {
          50: '#fdf4ff',
          100: '#fae8ff',
          200: '#f5d0fe',
          300: '#f0abfc',
          400: '#e879f9',
          500: '#d946ef',
          600: '#c026d3',
          700: '#a21caf',
          DEFAULT: '#a855f7', // roxo fofinho
        },
        accent: {
          400: '#fb923c',
          500: '#f97316',
          DEFAULT: '#fb923c', // laranja quente
        },
        success: '#22c55e',
        error: '#ef4444',
        cream: '#fff7ed',
      },
      fontFamily: {
        display: ['Comic Neue', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '3xl': '1.5rem',
        '4xl': '2rem',
      }
    },
  },
  plugins: [],
}