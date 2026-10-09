/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        cream: {
          50: '#FFFDF9',
          100: '#FFF8EE',
          200: '#FFF1E3',
          300: '#FFE8CC',
          400: '#FFD9AA',
        },
        navy: {
          900: '#0F0F23',
          800: '#1a1a2e',
          700: '#16213e',
        },
      },
      boxShadow: {
        btn: '0 2px 12px rgba(0,0,0,0.08)',
        'btn-hover': '0 6px 20px rgba(0,0,0,0.14)',
        card: '0 8px 40px rgba(0,0,0,0.1)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
};
