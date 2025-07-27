/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
   theme: {
    extend: {
      fontFamily: {
        montserrat: ['Montserrat', 'sans-serif'],
        playwrite: ['"Playwrite NL"', 'serif'],
        poppins: ['Poppins', 'sans-serif'],
        varela: ['"Varela Round"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}