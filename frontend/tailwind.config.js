/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#F5F0E6', // Warm cream/off-white - like aged paper
        panel: 'rgba(245, 240, 230, 0.8)', // Soft paper-like panel
        text: '#2C1810', // Deep brown/charcoal - like ink on paper
        border: '#D4C5B0', // Muted beige border
        accent: {
          gold: '#C9A962', // Muted gold - scholarly accent
          burgundy: '#722F37', // Wine/burgundy - classic library color
          leather: '#5D4037', // Leather brown - book binding feel
          sage: '#8FA995', // Sage green - natural, academic feel
        },
        primary: {
          DEFAULT: '#C9A962', // Gold for primary actions
          light: '#E8D59A',
          dark: '#A88B4F',
        }
      },
      fontFamily: {
        display: ['Merriweather', 'Georgia', 'serif'], // Academic serif for headings
        body: ['Lora', 'Georgia', 'serif'], // Readable serif for body text
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        }
      }
    },
  },
  plugins: [],
}
