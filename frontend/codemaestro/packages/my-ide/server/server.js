/**
 * server.js
 */

const express = require("express");
const http = require("http");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();

const WebSocket = require("ws");
const url = require("url");
const path = require("path"); // 추가: path 모듈을 가져옵니다.
const { setupWSConnection } = require("y-websocket/bin/utils");
const { LeveldbPersistence } = require("y-leveldb");
const Y = require("yjs");

// 절대경로로 데이터베이스 폴더 지정 (server.js 파일이 위치한 폴더 기준)
const persistence = new LeveldbPersistence(path.resolve(__dirname, "yjs-docs"));

const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
  })
);
app.use(express.json());

// AI 분석 결과 캐싱용
const analysisCache = new Map();

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

// y-websocket 서버 - 공유 그림판만 현재 사용 
const server = http.createServer(app);

const wss = new WebSocket.Server({
  server,
  maxPayload: 1000 * 1024 * 1024,
});

wss.on("connection", async (ws, req) => {
  const parsedUrl = url.parse(req.url, true);
  const docName = parsedUrl.pathname.slice(1) || "default";
  
  // Windows 파일 시스템에서 안전하도록 문서 이름에 포함된 금지 문자를 '_'로 치환
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
