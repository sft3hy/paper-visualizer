/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0B0F19', // Deep dark slate background
        panel: 'rgba(17, 24, 39, 0.7)', // Glassmorphic panel background
        primary: {
          DEFAULT: '#06B6D4', // Vibrant Cyan/Teal
          light: '#22D3EE',
          dark: '#0891B2',
        },
        accent: {
          purple: '#8B5CF6', // Accent Violet
          emerald: '#10B981', // Accent Emerald
          amber: '#F59E0B', // Accent Amber
        }
      },
      backdropBlur: {
        xs: '2px',
      },
      fontFamily: {
        display: ['Outfit', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
}
