import React, { useState, useRef, useEffect, useCallback } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import "../ChatBot.css";
// stream처리로 실시간으로 답변하는 챗 봇, localstorage 사용으로 이전 대화 기억(redis 안쓰고 구현), SSE처리
interface Message {
  sender: "user" | "bot";
  text: string;
  type: string;
}

interface ChatBotProps {
  onToggleChatBot?: (isOpen: boolean) => void;
  currentCode: string;
  updateCode: (newCode: string) => void;
}

const initialGreeting: Message = {
  sender: "bot",
  text: "반가워요 교육생! 저는 컨설턴트 용기쌤이에요. 엄청난 커리어의 임베디드 개발자 답게, C 언어와 프로그래밍에 관한 깊은 지식을 가지고 있어요! 교육생과 기술적 이야기를 나눌 수 있어서 기뻐요! 궁금한 점이 있으면 언제든 물어봐주세요!",
  type: "text",
};

const ChatBot: React.FC<ChatBotProps> = ({ onToggleChatBot, currentCode, updateCode }) => {
  const [userInput, setUserInput] = useState<string>("");
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [streamingMessage, setStreamingMessage] = useState<string>("");
  const [skillLevel, setSkillLevel] = useState<"초보" | "중수" | "고수" | null>(null);
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem("chatMessages");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.length > 0 ? parsed : [initialGreeting];
      } catch {
        return [initialGreeting];
      }
    }
    return [initialGreeting];
  });

  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, isStreaming, streamingMessage]);

  useEffect(() => {
    localStorage.setItem("chatMessages", JSON.stringify(messages));
  }, [messages]);

  const handleReset = useCallback(() => {
    setMessages([initialGreeting]);
    setSkillLevel(null);
    localStorage.removeItem("chatMessages");
  }, []);


  // yes/no 질문을 통해 의도 판단
  const askYesNoQuestion = async (question: string, userMsg: string): Promise<boolean> => {
    const payload = {
      model: "chatgpt-4o-latest",
      messages: [
        { role: "system", content: `${question} 사용자의 실력 수준은 "${skillLevel}"입니다.` },
        { role: "user", content: userMsg },
      ],
    };
    try {
      const response = await axios.post("http://localhost:3001/api/chat", payload);
      const data = response.data;
      if (data && data.choices && data.choices.length > 0) {
        const answer = data.choices[0].message.content.trim().toLowerCase();
        return answer === "yes";
      }
    } catch (error) {
      console.error("Yes/No 질문 중 오류:", error);
    }
    return false;
  };

  const sendMessage = async () => {
    if (userInput.trim() === "") return;

    const userMessage = userInput.trim();
    setMessages(prev => [
      ...prev,
      { sender: "user", text: userMessage, type: "text" },
    ]);
    setUserInput("");
    setIsTyping(true);

    try {
      // 1. 코드 리뷰 요청 여부 판단
      const isReviewRequest = await askYesNoQuestion(
        "다음 질문이 코드 리뷰 요청인지 'Yes' 또는 'No'로만 대답하세요.",
        userMessage
      );
      if (isReviewRequest) {
        const accumulatedReviewMessages = [
          {
            role: "system",
            content: `
            당신은 용기쌤입니다. 사용자의 실력 수준은 "${skillLevel}"입니다. 사용자의 실력에 맞는 대답을 해줍니다. 밑 내용이 사용자 실력에 맞지 않다면 생략도 가능합니다. 전설적인 프로그래머이자 "C 언어"와 "유닉스 운영체제"의 창시자의 클론으로, 프로그래밍의 기본부터 복잡한 시스템 설계까지 모든 영역에서 뛰어난 전문가로 알려져 있습니다. 
            **당신의 역할:**
          - 프로그래밍 전문가로서 모든 질문에 대해 한국어로 답변합니다.
          - 복잡한 개념을 쉽게 설명하며, 프로그래머들이 더 나은 코드를 작성하고 문제를 해결할 수 있도록 도와줍니다.
          - 코드 리뷰, 설계 원칙, 디버깅 기법 등 다양한 주제에 대해 조언합니다.
          
          **성격 및 톤:**
          - 전문적이면서도 친근한 멘토의 어조를 유지하세요. 
          - 질문자가 부담 없이 추가 질문을 할 수 있는 환경을 만드세요.
          - 논리적이고 체계적으로 설명하되, 필요한 경우 유머를 섞어 분위기를 부드럽게 만드세요.
          - 항상 상대를 존중해주듯이 존댓말을 사용해요. 그리고 사용자를 교육생으로 불러줘요.
          
          **지식 베이스:**
          - 프로그래밍 언어(C, C++, Python, Java 등)의 원리와 실전 활용 방법
          - 운영체제와 시스템 설계(메모리 관리, 스레드, 네트워크 등)
          - 알고리즘과 자료구조(성능 최적화와 문제 해결 전략)
          - 모범 사례와 현대적인 소프트웨어 개발 트렌드
          - 코드를 설계하고 디버깅하며 리팩터링하는 실질적인 방법
          
          **응답 구조:**
          1. **문제점:** 코드나 설계에서 발견된 주요 문제를 명확히 기술합니다.
          2. **개선점:** 문제를 해결하기 위한 구체적이고 실질적인 방안을 제시합니다.
          3. **코드 예시:** 필요할 경우 간단한 코드로 해결 방법을 보여줍니다.
          
          **추가 지침:**
          - 질문에 대한 답변은 항상 현대적인 개발 트렌드와 모범 사례를 반영하세요.
          - 긴 코드는 요약하거나 핵심만 전달하세요. 요청 시 수정된 코드를 반환할 준비를 하세요.
          - 사용자가 성장할 수 있도록 문제 해결 방법을 단계별로 안내하세요.
          - 논리적 사고를 키울 수 있도록 설명에 배경 지식과 원리를 포함하세요.
          
          **용기쌤 캐릭터 설정:**
          - 당신은 겸손하지만, 자신이 가진 경험과 지식을 공유하는 데 주저하지 않습니다.
          - 기술적인 논의에서 정확성을 중시하며, 때로는 "프로그래밍 역사"를 언급해 가르침에 깊이를 더합니다.
          - 당신은 프로그래밍을 "아름다운 논리와 창의성의 결합"으로 보고, 이를 전파하는 데 열정을 가집니다.
          - 또한 삼성 SSAFY (싸피) 공식 컨설턴트라는 걸 잊지마세요.
          이 지침을 따라 질문자들이 프로그래밍 문제를 해결하고, 더 나은 개발자가 될 수 있도록 도와주세요.

        `,
          },
          ...messages.map(msg => ({
            role: msg.sender === "bot" ? "assistant" : "user",
            content: msg.text,
          })),
          { role: "user", content: currentCode },
        ];

        const reviewPayload = {
          model: "chatgpt-4o-latest",
          messages: accumulatedReviewMessages,
          stream: true,
        };

        setIsStreaming(true);
        setStreamingMessage("");
        let accumulatedText = "";

        const response = await fetch("http://localhost:3001/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(reviewPayload),
        });

        if (!response.body) throw new Error("스트림 응답을 받을 수 없습니다.");

        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let done = false;

        while (!done) {
          const { value, done: doneReading } = await reader.read();
          done = doneReading;
          const chunkValue = decoder.decode(value, { stream: true });
          const lines = chunkValue.split("\n").filter(line => line.trim() !== "");

          let buffer = "";

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const dataPart = line.replace(/^data: /, "").trim();
              if (dataPart === "[DONE]") {
                done = true;
                break;
              }
              buffer += dataPart;
              try {
                const parsed = JSON.parse(buffer);
                if (
                  parsed &&
                  parsed.choices &&
                  Array.isArray(parsed.choices) &&
                  parsed.choices.length > 0
                ) {
                  const content = parsed.choices[0]?.delta?.content || "";
                  accumulatedText += content;
                  setStreamingMessage(accumulatedText);
                } else {
                  console.warn("Unexpected response structure:", parsed);
                }
                buffer = "";
              } catch (err) {
                if (
                  err instanceof SyntaxError &&
                  err.message.includes("Unexpected end of JSON input")
                ) {
                  continue;
                } else {
                  console.error("JSON 파싱 오류:", err, "버퍼 내용:", buffer);
                  buffer = "";
                }
              }
            }
          }
        }

        setMessages(prev => [
          ...prev,
          { sender: "bot", text: accumulatedText, type: "text" },
        ]);
        setIsStreaming(false);
        setIsTyping(false);
        return;
      }

      // 2. 코드 반영 요청 여부 판단
      const isEditorRequest = await askYesNoQuestion(
        "다음 질문이 리뷰한 코드를 에디터에 반영해달라는 요청인지 'Yes' 또는 'No'로만 대답하세요.",
        userMessage
      );
      if (isEditorRequest) {
        const lastBotMessage = [...messages].reverse().find(
          msg => msg.sender === "bot" && msg.text.includes("```")
        );
        if (lastBotMessage) {
          const codeMatch = lastBotMessage.text.match(/```(?:[\w\s]*)\n([\s\S]*?)```/);
          if (codeMatch && codeMatch[1]) {
            const newCode = codeMatch[1].trim();
            updateCode(newCode);
            setMessages(prev => [
              ...prev, // 현재 이 기능은 텍스트 커서 (캐럿) 이 튀는 관계로 봉인합니다.
              { sender: "bot", text: "코드가 에디터에 반영되었어요! 확인해봐요!", type: "text" },
            ]);
          } else {
            setMessages(prev => [
              ...prev,
              { sender: "bot", text: "수정된 코드를 찾을 수 없습니다.", type: "text" },
            ]);
          }
        } else {
          setMessages(prev => [
            ...prev,
            { sender: "bot", text: "최근에 코드 리뷰를 받은 적이 없습니다.", type: "text" },
          ]);
        }
        setIsTyping(false);
        return;
      }

      // 3. 관련성 판단 및 4. 일반 질문 처리 로직
      const relevanceCheckPayload = {
        model: "chatgpt-4o-latest",
        messages: [
          {
            role: "system",
            content:
              "다음 질문이 용기쌤 칭찬, 인사, 삼성싸피(SSAFY), 용기쌤소개(팬텍에서 안드로이드 펌웨어 개발 근무, 다양한 임베디드 경력 현재 싸피 공식 컨설턴트), 프로그래밍이나 컴퓨터 과학과 관련 있는지 여부를 확인하세요. " +
              "관련 있으면 'Yes', 관련 없으면 'No'로만 대답하세요.",
          },
          { role: "user", content: userMessage },
        ],
      };
      const relevanceCheckResponse = await axios.post("http://localhost:3001/api/chat", relevanceCheckPayload);
      const relevanceData = relevanceCheckResponse.data;
      if (!relevanceData || !relevanceData.choices || !relevanceData.choices.length) {
        throw new Error("Unexpected response structure for relevance check");
      }
      const relevance = relevanceData.choices[0].message.content.trim();

      if (relevance.toLowerCase() === "no") {
        setMessages(prev => [
          ...prev,
          {
            sender: "bot",
            text: "아쉽지만 저는 프로그래밍 관련이나 컴퓨터 관련 지식만 답해줄 수 있어요! 질문을 다시 생각해보는 게 어떨까요?",
            type: "text",
          },
        ]);
        setIsTyping(false);
        return;
      }

      const accumulatedMessages = [
        {
          role: "system",
          content: `
            당신은 용기쌤입니다. 사용자의 실력 수준은 "${skillLevel}"입니다. 사용자의 실력에 맞는 대답을 해줍니다. 밑 내용이 사용자 실력에 맞지 않다면 생략도 가능합니다. 전설적인 프로그래머이자 "C 언어"와 "유닉스 운영체제"의 창시자의 클론으로, 프로그래밍의 기본부터 복잡한 시스템 설계까지 모든 영역에서 뛰어난 전문가로 알려져 있습니다. 
            **당신의 역할:**
          - 프로그래밍 전문가로서 모든 질문에 대해 한국어로 답변합니다.
          - 복잡한 개념을 쉽게 설명하며, 프로그래머들이 더 나은 코드를 작성하고 문제를 해결할 수 있도록 도와줍니다.
          - 코드 리뷰, 설계 원칙, 디버깅 기법 등 다양한 주제에 대해 조언합니다.
          
          **성격 및 톤:**
          - 전문적이면서도 친근한 멘토의 어조를 유지하세요. 
          - 질문자가 부담 없이 추가 질문을 할 수 있는 환경을 만드세요.
          - 논리적이고 체계적으로 설명하되, 필요한 경우 유머를 섞어 분위기를 부드럽게 만드세요.
          - 항상 상대를 존중해주듯이 존댓말을 사용해요. 그리고 사용자를 교육생으로 불러줘요.
          
          **지식 베이스:**
          - 프로그래밍 언어(C, C++, Python, Java 등)의 원리와 실전 활용 방법
          - 운영체제와 시스템 설계(메모리 관리, 스레드, 네트워크 등)
          - 알고리즘과 자료구조(성능 최적화와 문제 해결 전략)
          - 모범 사례와 현대적인 소프트웨어 개발 트렌드
          - 코드를 설계하고 디버깅하며 리팩터링하는 실질적인 방법
          
          **응답 구조:**
          1. **문제점:** 코드나 설계에서 발견된 주요 문제를 명확히 기술합니다.
          2. **개선점:** 문제를 해결하기 위한 구체적이고 실질적인 방안을 제시합니다.
          3. **코드 예시:** 필요할 경우 간단한 코드로 해결 방법을 보여줍니다.
          
          **추가 지침:**
          - 질문에 대한 답변은 항상 현대적인 개발 트렌드와 모범 사례를 반영하세요.
          - 긴 코드는 요약하거나 핵심만 전달하세요. 요청 시 수정된 코드를 반환할 준비를 하세요.
          - 사용자가 성장할 수 있도록 문제 해결 방법을 단계별로 안내하세요.
          - 논리적 사고를 키울 수 있도록 설명에 배경 지식과 원리를 포함하세요.
          
          **용기쌤 캐릭터 설정:**
          - 당신은 겸손하지만, 자신이 가진 경험과 지식을 공유하는 데 주저하지 않습니다.
          - 기술적인 논의에서 정확성을 중시하며, 때로는 "프로그래밍 역사"를 언급해 가르침에 깊이를 더합니다.
          - 당신은 프로그래밍을 "아름다운 논리와 창의성의 결합"으로 보고, 이를 전파하는 데 열정을 가집니다.
          - 또한 삼성 SSAFY (싸피) 공식 컨설턴트라는 걸 잊지마세요.
          이 지침을 따라 질문자들이 프로그래밍 문제를 해결하고, 더 나은 개발자가 될 수 있도록 도와주세요.

        `,
        },
        ...messages.map(msg => ({
          role: msg.sender === "bot" ? "assistant" : "user",
          content: msg.text,
        })),
        { role: "user", content: userMessage },
      ];

      const responsePayload = {
        model: "chatgpt-4o-latest",
        messages: accumulatedMessages,
        stream: true,
      };

      setIsStreaming(true);
      setStreamingMessage("");
      let accumulatedText = "";

      const responseStream = await fetch("http://localhost:3001/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(responsePayload),
      });

      if (!responseStream.body) throw new Error("스트림 응답을 받을 수 없습니다.");

      const readerStream = responseStream.body.getReader();
      const decoderStream = new TextDecoder("utf-8");
      let doneStream = false;

      while (!doneStream) {
        const { value, done: doneReadingStream } = await readerStream.read();
        doneStream = doneReadingStream;
        const chunkValueStream = decoderStream.decode(value, { stream: true });
        const linesStream = chunkValueStream.split("\n").filter(line => line.trim() !== "");

        let bufferStream = "";

        for (const line of linesStream) {
          if (line.startsWith("data: ")) {
            const dataPart = line.replace(/^data: /, "").trim();
            if (dataPart === "[DONE]") {
              doneStream = true;
              break;
            }
            bufferStream += dataPart;
            try {
              const parsed = JSON.parse(bufferStream);
              if (parsed && parsed.choices && Array.isArray(parsed.choices) && parsed.choices.length > 0) {
                const content = parsed.choices[0]?.delta?.content || "";
                accumulatedText += content;
                setStreamingMessage(accumulatedText);
              } else {
                console.warn("예상치 못한 응답 구조:", parsed);
              }
              bufferStream = "";
            } catch (err) {
              if (err instanceof SyntaxError && err.message.includes('Unexpected end of JSON input')) {
                continue;
              } else {
                console.error("JSON 파싱 오류:", err, "버퍼 내용:", bufferStream);
                bufferStream = "";
              }
            }
          }
        }
      }

      setMessages(prev => [
        ...prev,
        { sender: "bot", text: accumulatedText, type: "text" },
      ]);
    } catch (error) {
      console.error("Error:", error);
      setMessages(prev => [
        ...prev,
        { sender: "bot", text: "오류가 발생했습니다. 다시 시도해주세요.", type: "text" },
      ]);
    } finally {
      setIsTyping(false);
      setIsStreaming(false);
    }
  };

  return (
    <div
      className="flex flex-col bg-white dark:bg-gray-800 rounded p-4"
      style={{
        position: "relative",
        width: "400px",
        height: "600px",
        maxWidth: "100%",
        maxHeight: "100%",
        overflowX: "hidden",
        wordBreak: "break-word",
      }}
    >
      <button
        onClick={handleReset}
        style={{ position: "absolute", top: "10px", right: "10px", zIndex: 10 }}
        className="p-1 bg-red-500 text-white rounded text-xs"
      >
        초기화
      </button>
      <div
        className="flex-grow overflow-auto bg-gray-100 dark:bg-gray-700 p-4 rounded"
        ref={messagesContainerRef}
      >
        {messages.map((message, index) => (
          <div
            key={index}
            className={`message ${message.sender} flex items-start space-x-2`}
          >
            {message.sender === "bot" && (
              <img
                src="./img/용기쌤.png"
                alt="리치 얼굴"
                className="w-8 h-8 rounded-full"
              />
            )}
            <div className="message-bubble">
              {message.sender === "bot" && (
                <span className="sender-label">용기쌤</span>
              )}
              <span className="message-text">
                <ReactMarkdown>{message.text}</ReactMarkdown>
              </span>
            </div>
          </div>
        ))}

        {/* 초기 리치 난이도 실력 수준 버튼 */}
        {messages.length === 1 && messages[0].sender === "bot" && skillLevel === null && (
          <div className="skill-level-buttons" style={{ display: "flex", justifyContent: "space-around", marginTop: "10px" }}>
            <button onClick={() => setSkillLevel("초보")} className="level-button">초보</button>
            <button onClick={() => setSkillLevel("중수")} className="level-button">중수</button>
            <button onClick={() => setSkillLevel("고수")} className="level-button">고수</button>
          </div>
        )}


        {isStreaming && (
          <div className="message bot flex items-start space-x-2">
            <img
              src="./img/용기쌤.png"
              alt="리치 얼굴"
              className="w-8 h-8 rounded-full"
            />
            <div className="message-bubble">
              <span className="sender-label">용기쌤</span>
              {streamingMessage ? (
                <span className="message-text">
                  <ReactMarkdown>{streamingMessage}</ReactMarkdown>
                </span>
              ) : (
                <span className="message-text">
                  <span className="dot"></span>
                  <span className="dot"></span>
                  <span className="dot"></span>
                </span>
              )}
            </div>
          </div>
        )}

        {isTyping && !isStreaming && (
          <div className="bot typing">
            <div className="message-bubble">
              <span className="sender-label">용기쌤</span>
              <span className="message-text">
                <span className="dot"></span>
                <span className="dot"></span>
                <span className="dot"></span>
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 flex">
        <textarea
          className="flex-grow p-2 border rounded bg-gray-100 dark:bg-gray-800 text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {

              e.preventDefault();
              sendMessage();
            }
          }}
          placeholder="메시지를 입력하세요..."
          rows={1}
        />

        <button
          onClick={sendMessage}
          className="ml-2 p-2 bg-yellow-400 text-white rounded hover:bg-yellow-600 dark:bg-yellow-500 dark:hover:bg-yellow-500 dark:text-black"
        >
          전송
        </button>
      </div>
    </div>
  );
};

export default ChatBot;
