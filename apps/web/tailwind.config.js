/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f2f9f4',
          100: '#e1f2e6',
          200: '#c5e5ce',
          300: '#99d1a9',
          400: '#64b67d',
          500: '#3d9a59',
          600: '#2a7c43',
          700: '#236337',
          800: '#1e4f2d',
          900: '#1b5e39', // Figma deep forest green
          950: '#0c2415',
        },
        accent: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316', // Figma vibrant orange
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
        sage: {
          50: '#f4f8f5',
          100: '#e8f2ea',
          200: '#d2e6d6',
          300: '#b0d4b7',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      }
    },
  },
  plugins: [],
}
