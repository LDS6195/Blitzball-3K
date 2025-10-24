/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // FFX Blitzball ocean theme
        ocean: {
          950: '#0A1628',
          900: '#0D1F3C',
          800: '#162B4D',
          700: '#1A3A5C',
          600: '#1E4A6E',
          500: '#2563A0',
        },
        aqua: {
          400: '#00D9FF',
          500: '#00BFFF',
          600: '#0099CC',
        },
        gold: {
          400: '#FFD700',
          500: '#FFA500',
          600: '#FF8C00',
        },
      },
      fontFamily: {
        header: ['Orbitron', 'Exo 2', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        gaming: '0.05em',
      },
    },
  },
  plugins: [],
}
