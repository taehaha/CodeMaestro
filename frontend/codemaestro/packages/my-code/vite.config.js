import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // "my-ide"를 my-ide 패키지의 src 폴더로 매핑합니다.
      "my-ide": path.resolve(__dirname, '../my-ide/src'),
    },
  },
  server: {
    port: 3000,
    open: true, // 서버 시작 시 브라우저 자동 열기
    historyApiFallback: true, // React Router 새로고침 문제 해결
  },
});
