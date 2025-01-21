import daisyui from 'daisyui';

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // 다크 모드 설정
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"], // Tailwind 적용 경로
  theme: {
    extend: {
      colors: {
        primaryBg: '#f9fafb',
        primaryText: '#1f2937',
        primaryHighlight: '#ffed4a',
        primaryBoxcolor: '#C9C9C9',
        darkPrimaryBg: '#202A34',
        darkText: '#d1d5db',
        darkHighlight: '#FFCC00',
        darkBoxColor: '#4A4C61',
      },
    },
  },
  plugins: [daisyui], // DaisyUI 플러그인 추가
};
