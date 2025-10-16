/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [ './index.html',  "./src/**/*.{html,js}"],
  theme: {
    extend: {
      fontFamily:{
        title: [ "Playwrite PL", "cursive"],
        head: [ "Playwrite PL",  "cursive"],
        menuFont: [ "Combo", "system-ui"]
      }
    },
  },
  plugins: [],
}

