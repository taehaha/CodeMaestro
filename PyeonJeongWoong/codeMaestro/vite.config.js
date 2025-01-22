import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    open: true, // 서버 시작 시 브라우저 자동 열기
    historyApiFallback: true, // React Router 새로고침 문제 해결
  },
});
