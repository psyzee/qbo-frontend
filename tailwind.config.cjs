module.exports = {
  content: ['./index.html','./src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors:{
        dark:'#111111',
        mid:'#2f2f2f',
        light:'#f6f6f6',
        accent:'#ffcb74'
      },
      fontFamily:{
        playfair:['Playfair Display','serif'],
        roboto:['Roboto','sans-serif']
      }
    }
  }
}
