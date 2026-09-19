/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#080c14',
        surface: {
          DEFAULT: '#0f172a',
          card: 'rgba(15, 23, 42, 0.75)',
          elevated: '#1e293b',
          highlight: 'rgba(255, 255, 255, 0.05)',
        },
        brand: {
          emerald: '#10b981',
          hover: '#059669',
          glow: 'rgba(16, 185, 129, 0.15)',
        },
        participant: {
          1: '#10b981',
          2: '#06b6d4',
          3: '#8b5cf6',
          4: '#f59e0b',
          5: '#ec4899',
          6: '#3b82f6',
        }
      },
      fontFamily: {
        sans: ['Outfit', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['Geist Mono', 'JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
