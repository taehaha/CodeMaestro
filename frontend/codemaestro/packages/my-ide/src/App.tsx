// src/App.tsx
import React, { useEffect, useState } from "react";
import { Base64 } from "js-base64";
import { Sun, Moon, Play, Save } from "lucide-react";
import PaintBoard from "./components/PaintBoard";
import Editor from "./components/Editor";
import InputArea from "./components/InputArea";
import OutputArea from "./components/OutputArea";
import LanguageSelector, { Language } from "./components/LanguageSelector";
import Chat from "./components/Chat";
import ChatBot from "./components/ChatBot";
import ChatComponent, { ChatMessage } from "./components/ChatComponent";
import "./App.css";
import { languageTemplates } from "./constants/languageTemplates";
import OpenviduClient from "./OpenviduClient";
import tokenStorage from "my-code/src/utils/tokenstorage";
import OpenBidooComponent from "./components/OpenBidooComponent";
import VideoControls from "./components/VideoControls";
import VideoGrid from "./components/VideoGrid";

const languages: Language[] = [
  { name: "Python", id: 71 },
  { name: "C++", id: 53 },
  { name: "Java", id: 62 },
  { name: "C", id: 50 },
];

const App: React.FC = () => {
  console.log("my-ide app loaded");
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [currentLeftTab, setCurrentLeftTab] = useState<"chat" | "chatbot" | "screen_share">("chat");
  const [currentRightTab, setCurrentRightTab] = useState<"code" | "paint">("code");
  const [leftWidth, setLeftWidth] = useState<number>(400);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // 코드 관련 상태
  const [code, setCode] = useState<string>("");
  const [input, setInput] = useState<string>("");
  const [output, setOutput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [execTime, setExecTime] = useState<number | null>(null);
  const [execMemory, setExecMemory] = useState<number | null>(null);
  const initialTemplateApplied = useState<boolean>(false)[0];
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(languages[0]);
  const [inputWidth, setInputWidth] = useState<number>(50);
  const [isSplitDragging, setIsSplitDragging] = useState<boolean>(false);

  // Openvidu 관련 상태
  const [ovClient, setOvClient] = useState<OpenviduClient | null>(null);
  // 내 퍼블리셔 스트림 관리자 (내 영상)
  const [publisherStreamManager, setPublisherStreamManager] = useState<any>(null);
  // 원격 구독자 스트림 관리자 배열 (상대 영상들)
  const [remoteStreamManagers, setRemoteStreamManagers] = useState<any[]>([]);

  // 채팅 관련 상태 추가
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  // 언어 템플릿 적용
  const prevTemplateRef = React.useRef<string>("");
  useEffect(() => {
    const template = languageTemplates.find(
      (lang) => lang.id === selectedLanguage.id
    )?.template || "";
    if (!initialTemplateApplied && (code.trim() === "" || code === prevTemplateRef.current)) {
      setCode(template);
      prevTemplateRef.current = template;
    }
  }, [selectedLanguage, code, initialTemplateApplied]);

  // 다크 모드 설정
  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [isDarkMode]);

  // 왼쪽 영역 드래그 핸들러
  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      const minLeftWidth = 200;
      const maxLeftWidth = window.innerWidth - 200;
      setLeftWidth(Math.max(minLeftWidth, Math.min(e.clientX, maxLeftWidth)));
    }
  };
  const handleMouseUp = () => setIsDragging(false);
  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  // Input/Output 분할 핸들러
  const handleSplitMouseDown = () => setIsSplitDragging(true);
  const handleSplitMouseMove = (e: MouseEvent) => {
    if (isSplitDragging) {
      const container = document.getElementById("input-output-container");
      if (container) {
        const rect = container.getBoundingClientRect();
        const offsetX = e.clientX - rect.left;
        let newWidth = (offsetX / rect.width) * 100;
        newWidth = Math.max(10, Math.min(newWidth, 90));
        setInputWidth(newWidth);
      }
    }
  };
  const handleSplitMouseUp = () => setIsSplitDragging(false);
  useEffect(() => {
    window.addEventListener("mousemove", handleSplitMouseMove);
    window.addEventListener("mouseup", handleSplitMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleSplitMouseMove);
      window.removeEventListener("mouseup", handleSplitMouseUp);
    };
  }, [isSplitDragging]);

  // Judge0 실행 (생략)
  const handleRunCode = async () => {
    setIsLoading(true);
    setOutput("");
    setExecTime(null);
    setExecMemory(null);
    try {
      const encodedCode = Base64.encode(code);
      const encodedInput = Base64.encode(input);
      const response = await fetch(
        "https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=true",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-RapidAPI-Key": process.env.REACT_APP_RAPIDAPI_KEY || "",
            "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
          },
          body: JSON.stringify({
            source_code: encodedCode,
            language_id: selectedLanguage.id,
            stdin: encodedInput,
          }),
        }
      );
      const { token } = await response.json();
      if (!token) throw new Error("Execution token not received.");
      let retries = 6;
      while (retries > 0) {
        const statusResponse = await fetch(
          `https://judge0-ce.p.rapidapi.com/submissions/${token}?base64_encoded=true&fields=stdout,stderr,time,memory,status,compile_output`,
          {
            headers: {
              "X-RapidAPI-Key": process.env.REACT_APP_RAPIDAPI_KEY || "",
              "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
            },
          }
        );
        const result = await statusResponse.json();
        console.log("Judge0 result:", result);
        if (result.status.id === 3) {
          const decodedStdout = result.stdout ? Base64.decode(result.stdout) : "";
          const decodedStderr = result.stderr ? Base64.decode(result.stderr) : "";
          setOutput(decodedStdout + (decodedStderr ? `\nError:\n${decodedStderr}` : ""));
          if (result.time != null) {
            const timeVal = parseFloat(result.time);
            if (!isNaN(timeVal)) setExecTime(timeVal * 1000);
          }
          if (result.memory != null) {
            const memVal = parseInt(result.memory, 10);
            if (!isNaN(memVal)) setExecMemory(memVal);
          }
          break;
        } else if (result.status.id === 7) {
          const errOutput = result.stderr ? Base64.decode(result.stderr) : "Unknown runtime error.";
          setOutput(`Runtime Error:\n${errOutput}`);
          break;
        } else if (result.status.id === 6) {
          const compileError = result.compile_output ? Base64.decode(result.compile_output) : "Unknown compilation error.";
          setOutput(`Compilation Error:\n${compileError}`);
          break;
        } else if (result.status.id === 11) {
          const errorOutput = result.stderr ? Base64.decode(result.stderr) : "Unknown error.";
          setOutput(`Error:\n${errorOutput}`);
          break;
        }
        retries--;
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    } catch (error) {
      setOutput(`Execution error: ${(error as Error).message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 언어에 따른 파일 확장자 반환 함수
  const getFileExtension = (language: Language): string => {
    switch (language.name) {
      case "Python":
        return "py";
      case "C++":
        return "cpp";
      case "Java":
        return "java";
      case "C":
        return "c";
      default:
        return "txt";
    }
  };

  // 코드 저장: 현재 코드를 선택한 언어의 확장자로 로컬에 저장
  const handleSaveCode = () => {
    const ext = getFileExtension(selectedLanguage);
    const filename = `code.${ext}`;
    const blob = new Blob([code], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // F9 키 컴파일 동작 (생략)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "F9") {
        e.preventDefault();
        console.log("F9 키 눌림 - 컴파일 실행");
        handleRunCode();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleRunCode]);

  // Openvidu 연결: 쿼리 파라미터 roomId를 사용하여 연결
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const roomId = searchParams.get('roomId');
    console.log("쿼리 파라미터에서 가져온 roomId:", roomId);
    if (!roomId || isNaN(Number(roomId))) {
      console.error("유효하지 않은 roomId입니다.");
      return;
    }
    const conferenceId = parseInt(roomId, 10);
    const HOST_URL = new URL("http://192.168.31.194:8080");
    const ACCESS_TOKEN = tokenStorage.getAccessToken() || "";
    const client = new OpenviduClient(HOST_URL, ACCESS_TOKEN, conferenceId);
    setOvClient(client);
    // 채팅 메시지 수신 콜백 설정
    client.setMessageReceivedCallback((userId: number, nickname: string, message: string) => {
      setChatMessages(prev => [...prev, { userId, nickname, message }]);
    });
    client.initConnection(1234, true, true)
      .then(() => {
        // 내 퍼블리셔 스트림 저장
        const publisher = client.getMyPublisher();
        setPublisherStreamManager(publisher);
        // 원격 구독자 스트림 저장
        setRemoteStreamManagers(client.getSubscribers());
        console.log("원격 구독자 스트림 관리자 설정됨:", client.getSubscribers());
      })
      .catch((err) => {
        console.error("Openvidu 연결 실패:", err);
      });
    return () => {
      client.disconnect();
    };
  }, []);

  // ChatComponent로부터 전달받은 메시지 송신 요청 처리
  const handleSendMessage = (message: string) => {
    if (ovClient) {
      ovClient.sendMessage(message);
    }
  };
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-black dark:text-white transition-colors duration-300 flex">
      {/* 왼쪽 영역 (채팅, 챗봇, 화면공유) */}
      <div
        style={{ width: leftWidth }}
        className="flex flex-col bg-gray-100 dark:bg-gray-800 transition-colors duration-300 scrollbar-thin-custom"
      >
        <div className="border-b border-gray-300 dark:border-gray-700 transition-colors duration-300">
          <ul className="flex flex-wrap -mb-px text-sm font-medium text-center text-gray-500 dark:text-gray-400">
            <li className="flex-1">
              <button
                onClick={() => setCurrentLeftTab("chat")}
                className={`inline-flex items-center justify-center w-full p-4 border-b-2 rounded-t-lg ${
                  currentLeftTab === "chat"
                    ? "text-yellow-600 border-yellow-600 dark:text-yellow-500 dark:border-yellow-500"
                    : "border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300"
                }`}
              >
                <img
                  src="/ide/img/talking.png"
                  alt="Chat"
                  className={`w-6 h-6 me-2 ${
                    currentLeftTab === "chat" ? "opacity-100" : "opacity-50"
                  }`}
                />
                채팅
              </button>
            </li>
            <li className="flex-1">
              <button
                onClick={() => setCurrentLeftTab("chatbot")}
                className={`inline-flex items-center justify-center w-full p-4 border-b-2 rounded-t-lg ${
                  currentLeftTab === "chatbot"
                    ? "text-yellow-600 border-yellow-600 dark:text-yellow-500 dark:border-yellow-500"
                    : "border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300"
                }`}
              >
                <img
                  src="/ide/img/robot.png"
                  alt="Chatbot"
                  className={`w-6 h-6 me-2 ${
                    currentLeftTab === "chatbot" ? "opacity-100" : "opacity-50"
                  }`}
                />
                챗봇
              </button>
            </li>
            <li className="flex-1">
              <button
                onClick={() => setCurrentLeftTab("screen_share")}
                className={`inline-flex items-center justify-center w-full p-4 border-b-2 rounded-t-lg ${
                  currentLeftTab === "screen_share"
                    ? "text-yellow-600 border-yellow-600 dark:text-yellow-500 dark:border-yellow-500"
                    : "border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300"
                }`}
              >
                <img
                  src="/ide/img/video.png"
                  alt="Screen Share"
                  className={`w-6 h-6 me-2 ${
                    currentLeftTab === "screen_share" ? "opacity-100" : "opacity-50"
                  }`}
                />
                화면공유
              </button>
            </li>
          </ul>
        </div>
        <div className="flex-grow overflow-auto p-2 bg-gray-200 dark:bg-gray-800 transition-colors duration-300 scrollbar-thin-custom">
          {currentLeftTab === "chat" && (
            <>
              {/* 내 영상 영역 */}
              {publisherStreamManager ? (
                <div className="mb-4">
                  <h3 className="text-lg font-bold mb-2">내 영상</h3>
                  <OpenBidooComponent streamManager={publisherStreamManager} />
                </div>
              ) : (
                <div>내 스트림이 설정되지 않았습니다.</div>
              )}
              {/* 상대방들 영상 영역 */}
              <div className="h-[40vh] resize-y overflow-auto rounded scrollbar-thin-custom">
                {remoteStreamManagers && remoteStreamManagers.length > 0 ? (
                  <VideoGrid
                    streamManagers={remoteStreamManagers}
                    currentUser={undefined}
                    onSelectUser={(streamManager) => {
                      // 사용자 선택 처리
                    }}
                  />
                ) : (
                  <div>원격 스트림 관리자가 설정되지 않았습니다.</div>
                )}
              </div>
              {/* 채팅 영역 */}
              <div className="h-[40vh] mt-2 rounded overflow-auto scrollbar-thin-custom bg-white dark:bg-gray-900 p-2">
                <ChatComponent
                  onSendMessage={handleSendMessage}
                  messages={chatMessages} currentUserId={1}        
                />
              </div>
            </>
          )}
          {currentLeftTab === "chatbot" && (
            <div className="h-[67vh] resize-y overflow-auto rounded scrollbar-thin-custom">
              <ChatBot currentCode={code} updateCode={setCode} />
            </div>
          )}
          {currentLeftTab === "screen_share" && <div>제작중</div>}
        </div>
      </div>
      <div
        className={`relative flex items-center justify-center w-3 h-full cursor-col-resize group ${
          isDragging
            ? "bg-gradient-to-b from-yellow-300 to-yellow-500"
            : "bg-gradient-to-b from-gray-300 to-gray-400"
        }`}
        style={{ height: "100vh" }}
        onMouseDown={() => setIsDragging(true)}
      >
        <div
          className={`w-6 h-20 rounded-full shadow-md border-2 ${
            isDragging
              ? "bg-yellow-500 border-yellow-700"
              : "bg-white border-gray-300 group-hover:border-blue-500"
          } transition-all transform ${
            isDragging ? "scale-125" : "group-hover:scale-110"
          }`}
        ></div>
      </div>
      {/* 오른쪽 영역 (코드, 그림판) */}
      <div className="flex-grow flex flex-col bg-white dark:bg-gray-900 transition-colors duration-300">
        <div className="flex flex-col bg-white dark:bg-gray-900 transition-colors duration-300">
          <ul className="flex flex-wrap -mb-px text-sm font-medium text-center text-gray-500 dark:text-gray-400">
            <li className="flex-1 relative">
              <button
                onClick={() => setCurrentRightTab("code")}
                className={`inline-flex items-center justify-center w-full p-4 border-b-2 rounded-t-lg ${
                  currentRightTab === "code"
                    ? "text-yellow-600 border-yellow-600 dark:text-yellow-500 dark:border-yellow-500"
                    : "border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300"
                }`}
              >
                <img
                  src="/ide/img/programming.png"
                  alt="Code"
                  className={`w-6 h-6 me-2 ${
                    currentRightTab === "code" ? "opacity-100" : "opacity-50"
                  }`}
                />
                코드
              </button>
              <div className="absolute top-0 left-0 mt-2 p-1">
                <LanguageSelector
                  languages={languages}
                  selectedLanguage={selectedLanguage}
                  setSelectedLanguage={setSelectedLanguage}
                />
              </div>
            </li>
            <li className="flex-1 relative">
              <button
                onClick={() => setCurrentRightTab("paint")}
                className={`inline-flex items-center justify-center w-full p-4 border-b-2 rounded-t-lg ${
                  currentRightTab === "paint"
                    ? "text-yellow-600 border-yellow-600 dark:text-yellow-500 dark:border-yellow-500"
                    : "border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300"
                }`}
              >
                <img
                  src="/ide/img/palette.png"
                  alt="Paint"
                  className={`w-6 h-6 me-2 ${
                    currentRightTab === "paint" ? "opacity-100" : "opacity-50"
                  }`}
                />
                그림판
              </button>
              <div className="absolute top-0 right-0 mt-2 p-1">
                <button
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className="p-2 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 dark:from-gray-700 dark:to-gray-600 hover:from-yellow-500 hover:to-orange-600 dark:hover:from-gray-600 dark:hover:to-gray-500 text-white shadow-lg transform hover:scale-105 transition duration-300 flex items-center justify-center"
                >
                  {isDarkMode ? (
                    <Sun className="w-6 h-6" />
                  ) : (
                    <Moon className="w-6 h-6" />
                  )}
                </button>
              </div>
            </li>
          </ul>
        </div>
        <div className="flex-grow overflow-auto p-4 transition-colors duration-300 scrollbar-thin-custom">
          <div style={{ display: currentRightTab === "code" ? "block" : "none" }}>
            <Editor
              code={code}
              handleCodeChange={setCode}
              isDarkMode={isDarkMode}
              selectedLanguage={selectedLanguage.id}
            />
            <div className="flex mt-4">
              <button
                onClick={handleRunCode}
                className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black rounded flex items-center transition duration-300 transform hover:scale-105 hover:shadow-lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  "실행 중..."
                ) : (
                  <>
                    <Play className="w-4 h-4 inline mr-2" />
                    컴파일/F9
                  </>
                )}
              </button>
              <button
                onClick={handleSaveCode}
                className="px-4 py-2 bg-gradient-to-r from-green-400 to-green-600 text-black rounded ml-4 flex items-center transition duration-300 transform hover:scale-105 hover:shadow-lg"
              >
                <Save className="w-4 h-4 inline mr-2" />
                코드 저장
              </button>
            </div>
            <div
              id="input-output-container"
              className="flex w-full mt-4 border border-gray-300 dark:border-gray-700 rounded scrollbar-thin-custom"
              style={{ height: "300px" }}
            >
              <div
                style={{ width: `${inputWidth}%` }}
                className="p-2 overflow-auto transition-colors duration-300 scrollbar-thin-custom"
              >
                <InputArea input={input} setInput={setInput} />
              </div>
              <div
                className="w-2 bg-gray-400 dark:bg-gray-700 cursor-col-resize"
                onMouseDown={handleSplitMouseDown}
              ></div>
              <div
                style={{ width: `${100 - inputWidth}%` }}
                className="p-2 overflow-auto transition-colors duration-300 scrollbar-thin-custom"
              >
                <OutputArea
                  output={output}
                  isLoading={isLoading}
                  execTime={execTime}
                  execMemory={execMemory}
                />
              </div>
            </div>
          </div>
          <div style={{ display: currentRightTab === "paint" ? "block" : "none" }}>
            <PaintBoard />
          </div>
        </div>
      </div>
      <VideoControls
        streamManager={publisherStreamManager}
        ovClient={ovClient}
        onLeave={() => {
          console.log("방에서 나갔습니다.");
        }}
      />
    </div>
  );
};

export default App;
