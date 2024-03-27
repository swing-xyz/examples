const defaultTheme = require('tailwindcss/defaultTheme')
const plugin = require('tailwindcss/plugin')

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    
    extend: {
      animation: {

      },
      
    },
  },
  plugins: [require('@tailwindcss/forms'), plugin(function({ addBase, theme }) {
    addBase({
      'ul': { listStyle: 'disc' },
      '*': { color: 'white' }
    })
  })],
  
}
