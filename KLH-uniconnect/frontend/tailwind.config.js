/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  safelist: [
    { pattern: /^bg-(teal|emerald|blue|violet|amber|purple|orange|red|indigo|pink|cyan|slate)-(50|100|200)/ },
    { pattern: /^text-(teal|emerald|blue|violet|amber|purple|orange|red|indigo|pink|cyan|slate)-(400|500|600|700)/ },
    { pattern: /^bg-(teal|emerald|blue|violet|amber|purple|orange|red|indigo|pink|cyan)-(100|200)/, variants: ['hover'] },
    { pattern: /^(from|via|to)-(teal|emerald|blue|violet|amber|purple|indigo|cyan)-(500|600|700)/ },
    { pattern: /^shadow-(teal|emerald|indigo|violet)-(500|600)\/(10|20)/ },
    { pattern: /^border-(teal|indigo|violet)-(400|500)/ },
    { pattern: /^ring-(teal|indigo|violet)-(500)\/(10)/ },
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'Poppins', 'Noto Sans Devanagari', 'Noto Sans Telugu', 'system-ui', 'sans-serif']
      },
      colors: {
        uniblue: '#0F5BFF',
        unigrad: '#7F5DFF',
        unipurple: '#5C4DFF',
        unililac: '#EAE6FF'
      },
      boxShadow: {
        soft: '0 25px 50px -25px rgba(15, 23, 42, 0.35)'
      }
    }
  },
  plugins: []
};
