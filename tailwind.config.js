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
        // Core Minimalist Monochrome Palette
        "charcoal": "#111111",
        "off-black": "#2F3437",
        "muted-gray": "#787774",
        "bone": "#F7F6F3",
        "surface": "#FFFFFF",
        "surface-subtle": "#F9F9F8",
        "border-subtle": "#EAEAEA",

        // Spot Pastels
        "pastel-green": "#EDF3EC",
        "pastel-green-text": "#346538",
        "pastel-blue": "#E1F3FE",
        "pastel-blue-text": "#1F6C9F",
        "pastel-red": "#FDEBEC",
        "pastel-red-text": "#9F2F2D",
        "pastel-yellow": "#FBF3DB",
        "pastel-yellow-text": "#956400",

        // Backward compatibility mappings seamlessly converted to warm monochrome
        "dark-green": "#111111",
        "midnight": "#2F3437",
        "rosy": "#9F2F2D",
        "moss": "#787774",
        "beige": "#F7F6F3",
      },
      fontFamily: {
        sans: [
          'SF Pro Display',
          'Geist Sans',
          '-apple-system',
          'BlinkMacSystemFont',
          'Helvetica Neue',
          'sans-serif',
        ],
        mono: [
          'Geist Mono',
          'SF Mono',
          'JetBrains Mono',
          'monospace',
        ],
        serif: [
          'Newsreader',
          'Playfair Display',
          'Georgia',
          'Cambria',
          'Times New Roman',
          'serif',
        ],
      },
      borderRadius: {
        'card': '10px',
        'interactive': '6px',
      },
    },
  },
  plugins: [],
}
