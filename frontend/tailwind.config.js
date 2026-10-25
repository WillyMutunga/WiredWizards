/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        solar: {
          50: '#fff7ed',
          100: '#ffedd5',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
        },
        navy: {
          800: '#111836',
          900: '#080c29',
          950: '#040618',
        },
        engineering: {
          100: '#e0f2fe',
          500: '#0284c7',
          700: '#0e385e',
        },
        metal: {
          100: '#f1f5f9',
          200: '#e2e8f0',
          500: '#64748b',
          700: '#334155',
        },
      },
    },
  },
  plugins: [],
};
