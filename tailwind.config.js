/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [ './index.html',  "./src/**/*.{html,js}"],
  theme: {
    extend: {
      fontFamily:{
        title: [ "Marck Script", "cursive"],
        h1s: ["Molle", "cursive"]
      }
    },
  },
  plugins: [],
}

