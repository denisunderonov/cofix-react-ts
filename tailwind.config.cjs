/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        dark: 'var(--color-dark)',
        surface: 'var(--color-surface)',
        muted: 'var(--color-muted)',
        accent: 'var(--color-accent)',
        success: 'var(--color-success)',
        danger: 'var(--color-danger)'
      },
      borderRadius: {
        md: 'var(--border-radius)'
      }
    }
  },
  plugins: []
}
