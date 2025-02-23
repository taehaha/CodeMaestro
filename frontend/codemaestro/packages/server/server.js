require('dotenv').config();
const express = require('express');
const path = require('path');
const app = express();

const PORT = 3000;

// CodeMaestro 기본 경로에 서빙
app.use(express.static(path.join(__dirname, '../my-code/dist')));

// my-ide 경로로 서빙
app.use('/ide', express.static(path.join(__dirname, '../my-ide/build')));

// 리액트 라우터 대응, 라우팅을 위해 모든 요청에 대해 index.html 제공
app.get('*', (req, res) => {
  if (req.originalUrl.startsWith('/ide')) {
    res.sendFile(path.join(__dirname, '../my-ide/build/index.html'));
  } else {
    res.sendFile(path.join(__dirname, '../my-code/dist/index.html'));
  }
});

app.listen(PORT, () => {
  console.log(`Express 서버가 포트 ${PORT}에서 실행 중입니다.`);
});
