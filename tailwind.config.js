/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          100: '#FFF9C4',
          200: '#FFF59D',
          300: '#FFF176',
          400: '#FFEE58',
          500: '#FFEB3B',
          600: '#FDD835',
          700: '#FBC02D',
          800: '#F9A825',
          900: '#F57F17',
          DEFAULT: '#FFD700',
          metallic: '#D4AF37',
        },
        dark: {
          bg: '#050505',
          surface: '#121212',
          card: '#1a1a1a',
        }
      },
      boxShadow: {
        'gold-glow': '0 0 15px rgba(255, 215, 0, 0.3)',
        '3d': '0 10px 20px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)',
        'inner-glow': 'inset 0 0 20px rgba(255, 215, 0, 0.05)',
      },
      fontFamily: {
        sans: ['Kufam', 'sans-serif'],
      }
    },
  },
  plugins: [],
}