/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        airbnb: '#FF385C',
        'airbnb-dark': '#E31C5F',
        'dark-bg': '#000000',
        'dark-card': '#111111',
        'dark-card2': '#1a1a1a',
        'dark-border': '#2a2a2a',
        'dark-hover': '#222222',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
