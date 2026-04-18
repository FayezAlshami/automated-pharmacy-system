/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['selector', '[data-theme="dark"]'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        /** Site palette — Primary #1A2A3A, Secondary #009EDB, Background #F4F6F8, Cards #FFFFFF, Text #0D1B2A, Borders #D0D7DE */
        slateAdmin: {
          50: '#F4F6F8',
          100: 'rgba(13, 27, 42, 0.06)',
          200: '#D0D7DE',
          300: '#D0D7DE',
          400: 'rgba(13, 27, 42, 0.40)',
          500: 'rgba(13, 27, 42, 0.50)',
          600: 'rgba(13, 27, 42, 0.62)',
          700: '#0D1B2A',
          800: '#1A2A3A',
          900: '#0D1B2A',
          950: '#1A2A3A',
        },
        brandSecondary: '#009EDB',
      },
      boxShadow: {
        dashboard: '0 24px 80px rgba(26, 42, 58, 0.14)',
      },
      fontFamily: {
        display: ['"Space Grotesk"', '"IBM Plex Sans Arabic"', 'sans-serif'],
        body: ['"IBM Plex Sans Arabic"', '"Segoe UI"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
