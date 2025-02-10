import React, { useState, useEffect, useRef, useCallback } from "react";
import { Base64 } from "js-base64";
import { Sun, Moon, Play } from "lucide-react";
import PaintBoard from "./components/PaintBoard";
import Editor from "./components/Editor";
import InputArea from "./components/InputArea";
import OutputArea from "./components/OutputArea";
import LanguageSelector, { Language } from "./components/LanguageSelector";
import Chat from "./components/Chat";
import ChatBot from "./components/ChatBot";
import { createClient } from "@liveblocks/client";
import { LiveblocksProvider } from "./liveblocks.config";
import "./App.css";
import { languageTemplates } from "./constants/languageTemplates";


const languages: Language[] = [
  { name: "Python", id: 71 },
  { name: "C++", id: 53 },
  { name: "Java", id: 62 },
  { name: "C", id: 50 },
];


const App = () => {

  console.log("my-ide app loaded");
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  const [currentLeftTab, setCurrentLeftTab] =
    useState<"chat" | "chatbot" | "screen_share">("chat");

  const [currentRightTab, setCurrentRightTab] =
    useState<"code" | "paint">("code");

  // 왼쪽 영역(채팅 패널) 
  const [leftWidth, setLeftWidth] = useState<number>(400);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // 코드 관련 변수들입니다잉잉
  const [code, setCode] = useState<string>("");
  const [input, setInput] = useState<string>("");
  const [output, setOutput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Judge0 실행 시간/메모리
  const [execTime, setExecTime] = useState<number | null>(null);
  const [execMemory, setExecMemory] = useState<number | null>(null);
  const initialTemplateApplied = useRef(false);
  // 언어 선택
  const [selectedLanguage, setSelectedLanguage] =
    useState<Language>(languages[0]);

  // Input/Output
  const [inputWidth, setInputWidth] = useState<number>(50);
  const [isSplitDragging, setIsSplitDragging] = useState<boolean>(false);

  const prevTemplateRef = useRef<string>("");

  // 언어 변경 시 템플릿 적용
  useEffect(() => {
    const template = languageTemplates.find(
      (lang) => lang.id === selectedLanguage.id
    )?.template || "";
    if (!initialTemplateApplied.current && (code.trim() === "" || code === prevTemplateRef.current)) {
      setCode(template);
      prevTemplateRef.current = template;
      initialTemplateApplied.current = true;
    }
  }, [selectedLanguage]);

  // 다크 모드 설정
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  // 왼쪽 영역 드래그
  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      const minLeftWidth = 200;
      const maxLeftWidth = window.innerWidth - 200;
      setLeftWidth(Math.max(minLeftWidth, Math.min(e.clientX, maxLeftWidth)));
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  // Input/Output 분할 
  const handleSplitMouseDown = () => {
    setIsSplitDragging(true);
  };

  const handleSplitMouseMove = (e: MouseEvent) => {
    if (isSplitDragging) {
      const container = document.getElementById("input-output-container");
      if (container) {
        const rect = container.getBoundingClientRect();
        const offsetX = e.clientX - rect.left;
        let newWidth = (offsetX / rect.width) * 100;
        if (newWidth < 10) newWidth = 10;
        if (newWidth > 90) newWidth = 90;
        setInputWidth(newWidth);
      }
    }
  };

  const handleSplitMouseUp = () => {
    setIsSplitDragging(false);
  };

  useEffect(() => {
    window.addEventListener("mousemove", handleSplitMouseMove);
    window.addEventListener("mouseup", handleSplitMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleSplitMouseMove);
      window.removeEventListener("mouseup", handleSplitMouseUp);
    };
  }, [isSplitDragging]);

  // 실행 Judge0
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
            if (!isNaN(timeVal)) {
              setExecTime(timeVal * 1000);
            }
          }
          if (result.memory != null) {
            const memVal = parseInt(result.memory, 10);
            if (!isNaN(memVal)) {
              setExecMemory(memVal);
            }
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
  // F9 키로 컴파일 버튼 클릭 동작
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "F9") {
        e.preventDefault(); // 기본 F9 동작 방지
        console.log("F9 키 눌림 - 컴파일 실행"); // 디버깅용 로그
        handleRunCode(); // 컴파일 실행
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown); // Cleanup
    };
  }, [handleRunCode]); // handleRunCode가 변경될 때마다 이벤트 리스너 등록

  return (
    <LiveblocksProvider>
      <div
        className={`min-h-screen flex 
      bg-white dark:bg-gray-900 
      text-black dark:text-white
      transition-colors duration-300
    `}
      >
        {/* 왼쪽 (채팅, 챗봇, 화면공유) */}
        <div
          style={{ width: leftWidth }}
          className="flex flex-col bg-gray-100 dark:bg-gray-800 transition-colors duration-300 scrollbar-thin-custom"
        >
          <div className="border-b border-gray-300 dark:border-gray-700 transition-colors duration-300">
            <ul className="flex flex-wrap -mb-px text-sm font-medium text-center text-gray-500 dark:text-gray-400">
              <li className="flex-1">
                <button
                  onClick={() => setCurrentLeftTab("chat")}
                  className={`inline-flex items-center justify-center w-full p-4 border-b-2 rounded-t-lg ${currentLeftTab === "chat"
                      ? "text-yellow-600 border-yellow-600 dark:text-yellow-500 dark:border-yellow-500"
                      : "border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300"
                    }`}
                >
                  <img
                    src="/ide/img/talking.png"
                    alt="Chat"
                    className={`w-6 h-6 me-2 ${currentLeftTab === "chat" ? "opacity-100" : "opacity-50"}`}
                  />
                  채팅
                </button>
              </li>
              <li className="flex-1">
                <button
                  onClick={() => setCurrentLeftTab("chatbot")}
                  className={`inline-flex items-center justify-center w-full p-4 border-b-2 rounded-t-lg ${currentLeftTab === "chatbot"
                      ? "text-yellow-600 border-yellow-600 dark:text-yellow-500 dark:border-yellow-500"
                      : "border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300"
                    }`}
                >
                  <img
                    src="/ide/img/robot.png"
                    alt="Chatbot"
                    className={`w-6 h-6 me-2 ${currentLeftTab === "chatbot" ? "opacity-100" : "opacity-50"}`}
                  />
                  챗봇
                </button>
              </li>
              <li className="flex-1">
                <button
                  onClick={() => setCurrentLeftTab("screen_share")}
                  className={`inline-flex items-center justify-center w-full p-4 border-b-2 rounded-t-lg ${currentLeftTab === "screen_share"
                      ? "text-yellow-600 border-yellow-600 dark:text-yellow-500 dark:border-yellow-500"
                      : "border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300"
                    }`}
                >
                  <img
                    src="/ide/img/video.png"
                    alt="Screen Share"
                    className={`w-6 h-6 me-2 ${currentLeftTab === "screen_share" ? "opacity-100" : "opacity-50"}`}
                  />
                  화면공유
                </button>
              </li>
            </ul>
          </div>

          <div className="flex-grow overflow-auto p-2 bg-gray-200 dark:bg-gray-800 transition-colors duration-300 scrollbar-thin-custom">
            {currentLeftTab === "chat" && (
              <div className="h-[50vh] resize-y overflow-auto rounded scrollbar-thin-custom">
                <Chat />
              </div>
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
          className={`relative flex items-center justify-center w-3 h-full cursor-col-resize group ${isDragging
              ? "bg-gradient-to-b from-yellow-300 to-yellow-500"
              : "bg-gradient-to-b from-gray-300 to-gray-400"
            }`}
          style={{ height: "100vh" }}
          onMouseDown={() => setIsDragging(true)}
        >
          <div
            className={`w-6 h-20 rounded-full shadow-md border-2 ${isDragging
                ? "bg-yellow-500 border-yellow-700"
                : "bg-white border-gray-300 group-hover:border-blue-500"
              } transition-all transform ${isDragging ? "scale-125" : "group-hover:scale-110"
              }`}
          ></div>
        </div>

        {/* 오른쪽 (언어 선택 + 다크모드 + 코드, 그림판) */}
        <div className="flex-grow flex flex-col bg-white dark:bg-gray-900 transition-colors duration-300">
          <div className="flex flex-col bg-white dark:bg-gray-900 transition-colors duration-300">
            <ul className="flex flex-wrap -mb-px text-sm font-medium text-center text-gray-500 dark:text-gray-400">
              {/* 코드 탭 */}
              <li className="flex-1 relative">
  <button
    onClick={() => setCurrentRightTab("code")}
    className={`inline-flex items-center justify-center w-full p-4 border-b-2 rounded-t-lg ${currentRightTab === "code"
      ? "text-yellow-600 border-yellow-600 dark:text-yellow-500 dark:border-yellow-500"
      : "border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300"
      }`}
  >
    <img
      src="/ide/img/programming.png"
      alt="Code"
      className={`w-6 h-6 me-2 ${currentRightTab === "code" ? "opacity-100" : "opacity-50"}`}
    />
    코드
  </button>

  {/* 코드 탭 내 언어 선택 버튼 (탭 안에 포함) */}
  <div className="absolute top-0 left-0 mt-2 p-1">
    <LanguageSelector
      languages={languages}
      selectedLanguage={selectedLanguage}
      setSelectedLanguage={setSelectedLanguage}
    />
  </div>
</li>

              {/* 그림판 탭 */}
              <li className="flex-1 relative">
                <button
                  onClick={() => setCurrentRightTab("paint")}
                  className={`inline-flex items-center justify-center w-full p-4 border-b-2 rounded-t-lg ${currentRightTab === "paint"
                      ? "text-yellow-600 border-yellow-600 dark:text-yellow-500 dark:border-yellow-500"
                      : "border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300"
                    }`}
                >
                  <img
                    src="/ide/img/palette.png"
                    alt="Paint"
                    className={`w-6 h-6 me-2 ${currentRightTab === "paint" ? "opacity-100" : "opacity-50"}`}
                  />
                  그림판
                </button>

                {/* 그림판 탭 내 다크모드 버튼 (탭 안에 포함) */}
                <div className="absolute top-0 right-0 mt-2 p-1">
                  <button
                    onClick={() => setIsDarkMode(!isDarkMode)}
                    className="p-2 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 dark:from-gray-700 dark:to-gray-600 hover:from-yellow-500 hover:to-orange-600 dark:hover:from-gray-600 dark:hover:to-gray-500 text-white shadow-lg transform hover:scale-105 transition duration-300 flex items-center justify-center"
                  >
                    {isDarkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
                  </button>
                </div>

              </li>
            </ul>
          </div>

          {/* 오른쪽 탭 내용 */}
          <div className="flex-grow overflow-auto p-4 transition-colors duration-300 scrollbar-thin-custom">
            <div style={{ display: currentRightTab === "code" ? "block" : "none" }}>
              <Editor
                code={code}
                handleCodeChange={setCode}
                isDarkMode={isDarkMode}
                selectedLanguage={selectedLanguage.id}
              />

              <button
                onClick={handleRunCode}
                className="px-4 py-2 bg-yellow-500 text-black rounded mt-4 flex items-center"
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
            {/* 그림판 */}
            <div style={{ display: currentRightTab === "paint" ? "block" : "none" }}>
              <PaintBoard />
            </div>
          </div>
        </div>
      </div>
    </LiveblocksProvider>

  )
};
export default App;
