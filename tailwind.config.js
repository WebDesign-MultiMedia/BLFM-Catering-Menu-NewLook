/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [ './index.html',  "./src/**/*.{html,js}"],
  theme: {
    extend: {
      fontFamily:{
        title: [ "Playwrite ES Deco", "cursive"],
        head: [ "Playwrite PL",  "cursive"],
        menuFont: [ "Cookie", "system-ui"]
      },
       colors:{
      'bodyNavFooter': "#021828",
      'greenMex': "#006341",
      'whiteMex': "#ffffff",
      'redMex' : "#CE1126"
    }
    },
  },
  plugins: [],
}

