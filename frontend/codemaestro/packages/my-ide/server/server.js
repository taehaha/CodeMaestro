
const express = require("express");
const http = require("http");
const axios = require("axios");
const cors = require("cors");

const WebSocket = require("ws");
const url = require("url");
const path = require("path"); // 추가: path 모듈
const { setupWSConnection } = require("y-websocket/bin/utils");
const { LeveldbPersistence } = require("y-leveldb");
const Y = require("yjs");

// 절대경로로 데이터베이스 폴더 지정 (server.js 파일이 위치한 폴더 기준)
const persistence = new LeveldbPersistence(path.resolve(__dirname, "yjs-docs"));

const app = express();

require("dotenv").config(path.resolve(__dirname, "../.env"));

console.log("환경변수");
console.log(process.env.OPENAI_API_KEY);
console.log(process.env.REACT_APP_FRONTEND_URL);


app.use(
  cors({
    origin: process.env.REACT_APP_FRONTEND_URL,
    // origin: "https://www.codemaestro.site",
  })
);
app.use(express.json());

// OpenAI API 요청 함수
async function openAIRequest(model, messages) {
  const response = await axios.post(
    "https://api.openai.com/v1/chat/completions",
    { model, messages },
    {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );
  return response.data;
}

// /api/chat  (AI 챗에서 호출)
app.post("/api/chat", async (req, res) => {
  try {
    const { messages, model, stream } = req.body;
    const actualModel = model || "gpt-3.5-turbo";

    const axiosConfig = {
      method: "POST",
      url: "https://api.openai.com/v1/chat/completions",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      data: { model: actualModel, messages, stream },
      responseType: stream ? "stream" : "json",
    };

    const response = await axios(axiosConfig);

    if (stream) {
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      response.data.pipe(res);

      response.data.on("end", () => {
        res.end();
      });

      response.data.on("error", (err) => {
        console.error("스트리밍 에러:", err);
        res.status(500).json({ error: "스트리밍 오류 발생" });
      });
    } else {
      res.json(response.data);
    }
  } catch (error) {
    console.error("서버 에러:", error);
    res.status(500).json({ error: error.toString() });
  }
});

// /api/analyze (AI 코드분석)
const analysisCache = new Map();
app.post("/api/analyze", async (req, res) => {
  try {
    const { code, language } = req.body;
    const cacheKey = `${language}:${code}`;

    if (analysisCache.has(cacheKey)) {
      console.log("캐시된 분석 결과 사용");
      return res.json({ result: analysisCache.get(cacheKey) });
    }

    const messages = [
      {
        role: "system",
        content: `당신은 프로그래밍 분석 도우미입니다. 다음 코드 스니펫을 분석하고 다음 정보를 제공하십시오:
- 시간 복잡도
- 공간 복잡도
- 잠재적인 문제
- 알고리즘 유형`,
      },
      { role: "user", content: `언어: ${language}\n\n코드:\n${code}` },
    ];

    const model = "gpt-3.5-turbo";
    const data = await openAIRequest(model, messages);
    const analysisResult = data.choices?.[0]?.message?.content || "분석 실패";

    analysisCache.set(cacheKey, analysisResult);

    res.json({ result: analysisResult });
  } catch (error) {
    console.error("분석 중 오류:", error);
    res.status(500).json({ error: error.toString() });
  }
});

// 그림판에서 전역 Clear를 위한 엔드포인트 (모든 클라이언트에 clear 명령 전송)
app.post("/api/clear", (req, res) => {
  // 모든 연결된 WebSocket 클라이언트에 clear 메시지 전송
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ type: "clear" }));
    }
  });
  res.json({ success: true });
});

// y-websocket 서버 - 그림판, 코드 동시 사용 
const server = http.createServer(app);

const wss = new WebSocket.Server({
  server,
  maxPayload: 1000 * 1024 * 1024,
});

wss.on("connection", async (ws, req) => {
  const parsedUrl = url.parse(req.url, true);
  const docName = parsedUrl.pathname.slice(1) || "default";
  
  const safeDocName = docName.replace(/[<>:"/\\|?*]/g, "_");
  console.log(`새 WebSocket 연결: 문서 이름 - ${safeDocName}`);

  try {
    await persistence.getYDoc(safeDocName);
    console.log(`문서 로드 완료: ${safeDocName}`);
  } catch (error) {
    console.warn(`문서 로드 실패 (없거나 손상됨): ${safeDocName}`);
    const newDoc = new Y.Doc();
    persistence.storeUpdate(safeDocName, Y.encodeStateAsUpdate(newDoc));
    console.log(`새 문서 생성: ${safeDocName}`);
  }

  setupWSConnection(ws, req, { docName: safeDocName, persistence });
  console.log(`WebSocket 연결 완료: 문서 - ${safeDocName}`);
});

// 포트 설정 및 서버 실행
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
});
