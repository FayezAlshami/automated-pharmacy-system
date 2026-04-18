/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#E6F7FD',
          100: '#CCEFFA',
          200: '#99DFF5',
          300: '#66D0EE',
          400: '#4FC3F7',
          500: '#009EDB',
          600: '#007DB0',
          700: '#005D84',
          800: '#003E58',
          900: '#1A2A3A',
        },
        accent:  '#00BFA6',
        success: '#4CAF50',
        error:   '#F44336',
        warning: '#FFC107',
      },
      boxShadow: {
        portal: '0 28px 80px rgba(0, 42, 58, 0.12)',
        card:   '0 4px 24px rgba(0, 158, 219, 0.08)',
      },
      fontFamily: {
        display: ['"Manrope"', '"IBM Plex Sans Arabic"', 'sans-serif'],
        body:    ['"IBM Plex Sans Arabic"', '"Segoe UI"', 'sans-serif'],
      },
      backgroundImage: {
        'portal-surface':
          'linear-gradient(170deg, #FFFFFF 0%, #F0F7FC 55%, #E8F4FA 100%)',
      },
    },
  },
  plugins: [],
}
