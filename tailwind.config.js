/** @type {import('tailwindcss').Config} */
module.exports = {
  
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        keyframes: {
          slideIn: {
            '0%': {
              transform: 'translateY(100%)', // Start from below
            },
            '100%': {
              transform: 'translateY(0)', // End at original position
            },
          },
        },
        animation: {
          'slide-in': 'slideIn 6s ease-in-out forwards', // Add the slide-in animation
        },
      },
    },
    plugins: [
      require('tailwind-scrollbar'),
    ],
  }
