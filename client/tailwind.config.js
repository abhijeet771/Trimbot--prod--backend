/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        tokyo: {
          dark: '#0f0f12',
          card: 'rgba(20, 20, 26, 0.7)',
          accent: '#c0a060', // gold
          accentHover: '#ab8a4a',
          purple: '#7aa2f7',
          pink: '#f7768e',
          text: '#a9b1d6',
          textMuted: '#565f89',
        }
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
