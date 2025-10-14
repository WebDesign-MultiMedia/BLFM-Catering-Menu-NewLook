/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [ './index.html',  "./src/**/*.{html,js}"],
  theme: {
    extend: {
      fontFamily:{
        title: [ "Marck Script", "cursive"],
        head: [ "Cookie",  "cursive"],
        menuFont: [ "Combo", "system-ui"]
      }
    },
  },
  plugins: [],
}

