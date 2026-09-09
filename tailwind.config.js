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
        navy: {
          950: '#080D1A',
          900: '#0F172A', // Main dark background
          850: '#141E33',
          800: '#1E293B', // Card / surface
          750: '#25334A',
          700: '#334155', // Border
          600: '#475569',
        },
        electric: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD', // Soft ice blue text
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB', // Solid Electric Blue CTA
          700: '#1D4ED8',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', '"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', '"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      animation: {
        'flash': 'flash 0.35s ease-out',
      },
      keyframes: {
        flash: {
          '0%': { opacity: '0.95' },
          '100%': { opacity: '0' },
        },
      },
      boxShadow: {
        'clean-blue': '0 4px 14px 0 rgba(37, 99, 235, 0.25)',
        'clean-card': '0 10px 30px -10px rgba(0, 0, 0, 0.5)',
      }
    },
  },
  plugins: [],
}
