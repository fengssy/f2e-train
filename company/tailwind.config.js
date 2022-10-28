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
        '8px-vw': '1.041vw',
        '16px-vw': '2.082vw',
        '24px-vw': '3.123vw',
        '32px-vw': '4.16vw',
        '38px-vw': '4.948vw',
        '42px-vw': '5.46875vw',
        '48px-vw': '6.25vw',
        '144px-vw': '18.75vw',
        '496px-vw': '64.58vw',
        '540px-vw': '70.31vw',
        '800px-vw': '104.17vw',
        
        '540px': '33.75rem',
        '800px': '50rem',
      }
    }
  },
  plugins: [],
}
