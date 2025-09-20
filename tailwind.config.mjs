/** @type {import('tailwindcss').Config} */

export default {
  content: ['./src/**/*.{mjs,js,ts,jsx,tsx,html}','./visuals/**/*.{mjs,js,ts,jsx,tsx,html}'],
  theme: {

    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      colors: {
        'bleu_de_france': {
          DEFAULT: '#0088F9',
          100: '#001b32',
          200: '#003764',
          300: '#005296',
          400: '#006ec8',
          500: '#0088f9',
          600: '#2fa1ff',
          700: '#63b9ff',
          800: '#97d0ff',
          900: '#cbe8ff'
        },
        'keppel': {
          DEFAULT: '#36B39B',
          100: '#0b241f',
          200: '#16483e',
          300: '#206c5d',
          400: '#2b917c',
          500: '#36b39b',
          600: '#55ccb5',
          700: '#80d9c7',
          800: '#aae6da',
          900: '#d5f2ec'
        },
        'saffron': {
          DEFAULT: '#F2C438',
          100: '#382b04',
          200: '#6f5507',
          300: '#a7800b',
          400: '#deaa0e',
          500: '#f2c438',
          600: '#f5cf5e',
          700: '#f7db86',
          800: '#fae7ae',
          900: '#fcf3d7'
        },
        'gunmetal': {
          DEFAULT: '#22282C',
          100: '#070809',
          200: '#0d1011',
          300: '#14181a',
          400: '#1b1f23',
          500: '#22282c',
          600: '#47545c',
          700: '#6d808d',
          800: '#9dabb4',
          900: '#ced5d9'
        },
        'white': {
          DEFAULT: '#FDFCFB',
          100: '#433222',
          200: '#866544',
          300: '#ba9775',
          400: '#dbcab8',
          500: '#fdfcfb',
          600: '#fefdfc',
          700: '#fefdfd',
          800: '#fefefe',
          900: '#fffefe'
        }
      }
    }
  },
  plugins: []
}
