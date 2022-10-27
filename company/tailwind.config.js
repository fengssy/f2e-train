/** @type {import('tailwindcss').Config} */
module.exports = {
  purge: [
    './src/**/*.html',
    './src/**/*.js',
  ],
  content: [],
  theme: {
    extend: {
      spacing: {
        '540': '33.75rem',
        '800': '50rem',
      }
    }
  },
  plugins: [],
}
