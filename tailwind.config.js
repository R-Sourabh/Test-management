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
          DEFAULT: '#6D7EF2',
          hover: '#5E71EC',
          dark: '#191D59',
          light: '#EEF3FF',
        },
        content: {
          main: '#1F2A3C',
          body: '#3A4658',
          muted: '#4F5C6F',
          subtle: '#6E7A8A',
          lighter: '#8B96A8',
          lightest: '#AAB4C3',
        },
        surface: {
          base: '#EBF0F6',
          card: '#E8EDF5',
          input: '#E4EAF3',
          hover: '#F4F6FB',
          dark: '#2F3A4C',
        },
        status: {
          success: {
            DEFAULT: '#25A76C',
            bg: '#E8F8F0',
            border: '#BDE8D3',
          },
          warning: {
            DEFAULT: '#D3A127',
            bg: '#FFF9EC',
            border: '#FFD67A',
          },
          danger: {
            DEFAULT: '#D14343',
            hover: '#F26D6D',
            bg: '#FFF5F5',
            border: '#F2C7C7',
          }
        }
      }
    },
  },
  plugins: [],
}