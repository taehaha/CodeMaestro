/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',  // 다크 모드 활성화 방식 설정
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        'spin-slow': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'bounce-slow': {
          '0%, 100%': { transform: 'translateY(-25%)', opacity: 1 },
          '50%': { transform: 'translateY(0)', opacity: 0.5 },
        },
      },
      animation: {
        'spin-slow': 'spin-slow 3s linear infinite',
        'bounce-slow': 'bounce-slow 2s infinite',
      },
    },
  },
  plugins: [],
}
