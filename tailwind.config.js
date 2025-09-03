/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: 'hsl(240 5.9% 98%)',
        accent: 'hsl(220 47.2% 47.1%)',
        primary: 'hsl(240 5.9% 10%)',
        surface: 'hsl(0 0% 100%)',
        dark: {
          bg: 'hsl(240 10% 3.9%)',
          surface: 'hsl(240 10% 8%)',
          border: 'hsl(240 3.7% 15.9%)',
        }
      },
      spacing: {
        'sm': '8px',
        'md': '16px',
        'lg': '24px',
      },
      borderRadius: {
        'sm': '4px',
        'md': '8px',
        'lg': '12px',
      },
      boxShadow: {
        'card': 'rgba(0, 0, 0, 0.12) 0px 8px 24px',
      }
    },
  },
  plugins: [],
}