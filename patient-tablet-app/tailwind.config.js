/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#009EDB',
          muted: '#E6F7FC',
        },
        ink: {
          DEFAULT: '#1A2A3A',
          muted: '#5A6B7A',
        },
        line: '#E2E8F0',
        success: '#4CAF50',
        error: '#F44336',
        processing: '#FFC107',
        background: '#FFFFFF',
        brand: {
          50: '#E6F7FC',
          100: '#C8ECFA',
          200: '#9DD8F2',
          300: '#66C0E8',
          400: '#33A8DE',
          500: '#009EDB',
          600: '#0086BC',
          700: '#006E9D',
          800: '#00567E',
          900: '#003E5F',
        },
        night: '#1A2A3A',
        mist: '#E6F7FC',
      },
      boxShadow: {
        ambient: '0 24px 64px rgba(26, 42, 58, 0.08)',
        lift: '0 12px 40px rgba(0, 158, 219, 0.12)',
      },
      backgroundImage: {
        'kiosk-mesh':
          'radial-gradient(ellipse 120% 80% at 100% 0%, rgba(0, 158, 219, 0.07), transparent 50%), radial-gradient(ellipse 80% 60% at 0% 100%, rgba(0, 158, 219, 0.05), transparent 45%), linear-gradient(180deg, #FFFFFF 0%, #FAFCFE 100%)',
      },
      fontFamily: {
        display: ['"IBM Plex Sans Arabic"', '"Segoe UI"', 'sans-serif'],
        body: ['"Tajawal"', '"Segoe UI"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
