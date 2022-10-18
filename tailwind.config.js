/** @type {import('tailwindcss').Config} */
const colors = require('tailwindcss/colors');

module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      spacing: {
        '0.75em': '0.75em',
        '1em': '1em',
        '2em': '2em',
        '3em': '3em',
        '4em': '4em'
      }
    },
    colors: {
      primary: colors.purple,
      secondary: colors.yellow,
      neutral: colors.gray,
      overlay1: '#212128',
      hover: '#0b0b0d',
      active: '#2f2d33',
      secondaryhover: '#2f2d33',
      gray: colors.gray,
      emerald: colors.emerald,
      white: colors.white,
      form: '#292830',
      red: colors.red,
      background: '#111115',
      yellow: '#FCD25A'
    }
  },
  plugins: [],
}
