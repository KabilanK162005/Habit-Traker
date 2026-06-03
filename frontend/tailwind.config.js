/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#6D5DFE',
          dark: '#5B4EED',
        },
        secondary: {
          DEFAULT: '#8B5CF6',
          dark: '#7C3AED',
        },
        success: '#22C55E',
        danger: '#EF4444',
        warning: '#F59E0B',
        darkbg: {
          DEFAULT: '#0F172A',
          card: 'rgba(30, 41, 59, 0.7)',
          border: 'rgba(51, 65, 85, 0.5)',
        },
        lightbg: {
          DEFAULT: '#F8FAFC',
          card: 'rgba(255, 255, 255, 0.8)',
          border: 'rgba(226, 232, 240, 0.6)',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Outfit', 'sans-serif'],
      },
      boxShadow: {
        'premium': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        'soft': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      },
      backdropBlur: {
        'premium': '16px',
      }
    },
  },
  plugins: [],
}
