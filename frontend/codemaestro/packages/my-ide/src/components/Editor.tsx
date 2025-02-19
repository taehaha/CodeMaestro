import React, { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { basicSetup } from "@uiw/react-codemirror";
import { oneDark } from "@codemirror/theme-one-dark";
import { python } from "@codemirror/lang-python";
import { cpp } from "@codemirror/lang-cpp";
import { java } from "@codemirror/lang-java";
import { inlineCopilot } from "codemirror-copilot";
import { autocompletion, CompletionContext } from "@codemirror/autocomplete";
import { Copy } from "lucide-react";
import * as Y from "yjs";
import { yCollab } from "y-codemirror.next";
import { EditorState, Compartment } from "@codemirror/state";
import { EditorView, keymap } from "@codemirror/view";
import { linter, lintGutter } from "@codemirror/lint";
import { pythonLinter } from "../lint/pythonLinter";
import { cppLinter } from "../lint/cppLinter";
import { javaLinter } from "../lint/javaLinter";
import { indentWithTab } from "@codemirror/commands";
import { WebsocketProvider } from "y-websocket";
import { AvatarStackCollab } from "./AvatarStackCollab";


interface EditorProps {
  code: string;
  handleCodeChange: (value: string) => void;
  isDarkMode: boolean;
  selectedLanguage: number;
}

// 파이썬 자동완성 데이터
const pythonCompletions = [
  { label: "print", type: "function", detail: "출력 함수" },
  { label: "len", type: "function", detail: "객체의 길이 반환" },
  { label: "type", type: "function", detail: "객체의 유형 반환" },
  { label: "int", type: "function", detail: "정수로 변환" },
  { label: "float", type: "function", detail: "부동 소수점으로 변환" },
  { label: "str", type: "function", detail: "문자열로 변환" },
  { label: "list", type: "function", detail: "리스트 생성" },
  { label: "dict", type: "function", detail: "딕셔너리 생성" },
  { label: "set", type: "function", detail: "집합 생성" },
  { label: "tuple", type: "function", detail: "튜플 생성" },
  { label: "input", type: "function", detail: "사용자로부터 입력 받기" },
  { label: "sum", type: "function", detail: "합계를 반환" },
  { label: "range", type: "function", detail: "범위 객체 생성" },
  { label: "map", type: "function", detail: "함수를 적용한 객체 반환" },
  { label: "filter", type: "function", detail: "조건을 만족하는 객체 반환" },
  { label: "open", type: "function", detail: "파일 열기" },
  { label: "isinstance", type: "function", detail: "객체가 특정 클래스인지 확인" },
  { label: "enumerate", type: "function", detail: "객체를 인덱스와 함께 반환" },
  { label: "zip", type: "function", detail: "객체를 병합" },
  { label: "max", type: "function", detail: "최대값 반환" },
  { label: "min", type: "function", detail: "최소값 반환" },
  { label: "abs", type: "function", detail: "절대값 계산" },
  { label: "round", type: "function", detail: "반올림 함수" },
  { label: "sorted", type: "function", detail: "정렬된 객체 반환" },
  { label: "reversed", type: "function", detail: "역순 객체 반환" },
  { label: "for", type: "keyword", detail: "반복문" },
  { label: "while", type: "keyword", detail: "조건 기반 반복문" },
  { label: "if", type: "keyword", detail: "조건문" },
  { label: "else", type: "keyword", detail: "조건문 대체" },
  { label: "elif", type: "keyword", detail: "다중 조건" },
  { label: "break", type: "keyword", detail: "루프 중단" },
  { label: "continue", type: "keyword", detail: "다음 반복으로 건너뛰기" },
  { label: "pass", type: "keyword", detail: "아무 동작도 하지 않음" },
  { label: "def", type: "keyword", detail: "함수 정의" },
  { label: "return", type: "keyword", detail: "값 반환" },
  { label: "lambda", type: "keyword", detail: "익명 함수 정의" },
  { label: "import", type: "keyword", detail: "모듈 가져오기" },
  { label: "from", type: "keyword", detail: "모듈에서 특정 항목 가져오기" },
  { label: "class", type: "keyword", detail: "클래스 정의" },
  { label: "try", type: "keyword", detail: "예외 처리 시작" },
  { label: "except", type: "keyword", detail: "예외 처리" },
  { label: "finally", type: "keyword", detail: "예외 처리 종료 블록" },
  { label: "raise", type: "keyword", detail: "예외 발생" },
  { label: "with", type: "keyword", detail: "컨텍스트 관리" },
  { label: "as", type: "keyword", detail: "별칭 정의" },
  { label: "is", type: "keyword", detail: "객체 동일성 확인" },
  { label: "in", type: "keyword", detail: "멤버십 확인" },
  { label: "not", type: "keyword", detail: "논리 NOT 연산" },
  { label: "and", type: "keyword", detail: "논리 AND 연산" },
  { label: "or", type: "keyword", detail: "논리 OR 연산" },
  { label: "True", type: "literal", detail: "참 논리값" },
  { label: "False", type: "literal", detail: "거짓 논리값" },
  { label: "None", type: "literal", detail: "Null 값" },
];

const cppCompletions = [
  { label: "printf", type: "function", detail: "C 출력 함수" },
  { label: "scanf", type: "function", detail: "C 입력 함수" },
  { label: "malloc", type: "function", detail: "메모리 할당 함수" },
  { label: "free", type: "function", detail: "메모리 해제 함수" },
  { label: "strlen", type: "function", detail: "문자열 길이 계산" },
  { label: "strcpy", type: "function", detail: "문자열 복사" },
  { label: "strcmp", type: "function", detail: "문자열 비교" },
  { label: "strcat", type: "function", detail: "문자열 연결" },
  { label: "memcpy", type: "function", detail: "메모리 복사" },
  { label: "memset", type: "function", detail: "메모리 초기화" },
  { label: "fopen", type: "function", detail: "파일 열기" },
  { label: "fclose", type: "function", detail: "파일 닫기" },
  { label: "fscanf", type: "function", detail: "파일 입력 함수" },
  { label: "fprintf", type: "function", detail: "파일 출력 함수" },
  { label: "std::cout", type: "function", detail: "C++ 출력 스트림" },
  { label: "std::cin", type: "function", detail: "C++ 입력 스트림" },
  { label: "std::endl", type: "function", detail: "출력 줄 바꿈" },
  { label: "std::string", type: "type", detail: "문자열 클래스" },
  { label: "std::vector", type: "type", detail: "동적 배열" },
  { label: "std::array", type: "type", detail: "고정 크기 배열" },
  { label: "std::map", type: "type", detail: "키-값 저장" },
  { label: "std::unordered_map", type: "type", detail: "빠른 키-값 저장" },
  { label: "std::set", type: "type", detail: "집합 컨테이너" },
  { label: "std::unordered_set", type: "type", detail: "빠른 집합 컨테이너" },
  { label: "std::list", type: "type", detail: "연결 리스트" },
  { label: "std::deque", type: "type", detail: "양방향 큐" },
  { label: "std::queue", type: "type", detail: "FIFO 큐" },
  { label: "std::stack", type: "type", detail: "LIFO 스택" },
  { label: "std::priority_queue", type: "type", detail: "우선순위 큐" },
  { label: "std::algorithm", type: "header", detail: "알고리즘 라이브러리" },
  { label: "std::sort", type: "function", detail: "정렬 함수" },
  { label: "std::find", type: "function", detail: "요소 찾기" },
  { label: "std::reverse", type: "function", detail: "컨테이너 뒤집기" },
  { label: "std::min", type: "function", detail: "최소값 계산" },
  { label: "std::max", type: "function", detail: "최대값 계산" },
  { label: "std::accumulate", type: "function", detail: "누적 합 계산" },
  { label: "std::copy", type: "function", detail: "컨테이너 복사" },
  { label: "std::unique", type: "function", detail: "중복 제거" },
  { label: "#include", type: "keyword", detail: "헤더 파일 포함" },
  { label: "return", type: "keyword", detail: "값 반환" },
  { label: "int", type: "type", detail: "정수 타입" },
  { label: "float", type: "type", detail: "부동소수점 타입" },
  { label: "double", type: "type", detail: "더블 타입" },
  { label: "char", type: "type", detail: "문자 타입" },
  { label: "bool", type: "type", detail: "불리언 타입" },
  { label: "true", type: "literal", detail: "참 논리값" },
  { label: "false", type: "literal", detail: "거짓 논리값" },
  { label: "nullptr", type: "literal", detail: "포인터 초기화 값" },
  { label: "if", type: "keyword", detail: "조건문" },
  { label: "else", type: "keyword", detail: "조건문의 대안" },
  { label: "switch", type: "keyword", detail: "다중 조건문" },
  { label: "case", type: "keyword", detail: "조건문 옵션" },
  { label: "default", type: "keyword", detail: "조건문 기본값" },
  { label: "for", type: "keyword", detail: "반복문 (일반)" },
  { label: "while", type: "keyword", detail: "반복문 (조건)" },
  { label: "do", type: "keyword", detail: "최소 1회 실행 반복문" },
  { label: "break", type: "keyword", detail: "루프 중단" },
  { label: "continue", type: "keyword", detail: "루프 다음 반복 실행" },
  { label: "class", type: "keyword", detail: "클래스 정의" },
  { label: "struct", type: "keyword", detail: "구조체 정의" },
  { label: "namespace", type: "keyword", detail: "네임스페이스 정의" },
  { label: "using", type: "keyword", detail: "네임스페이스 사용" },
  { label: "template", type: "keyword", detail: "템플릿 정의" },
  { label: "public", type: "keyword", detail: "접근 제어자 (공개)" },
  { label: "private", type: "keyword", detail: "접근 제어자 (비공개)" },
  { label: "protected", type: "keyword", detail: "접근 제어자 (상속 제한)" },
  { label: "virtual", type: "keyword", detail: "가상 함수 정의" },
  { label: "override", type: "keyword", detail: "가상 함수 재정의" },
  { label: "static", type: "keyword", detail: "정적 멤버 정의" },
  { label: "constexpr", type: "keyword", detail: "컴파일 타임 상수" },
  { label: "inline", type: "keyword", detail: "인라인 함수" },
  { label: "volatile", type: "keyword", detail: "변수 변경 방지" },
];

const javaCompletions = [
  { label: "extends", type: "keyword", detail: "클래스 상속" },
  { label: "implements", type: "keyword", detail: "인터페이스 구현" },
  { label: "interface", type: "keyword", detail: "인터페이스 정의" },
  { label: "final", type: "keyword", detail: "상수 또는 변경 불가 선언" },
  { label: "abstract", type: "keyword", detail: "추상 클래스 또는 메서드" },
  { label: "try", type: "keyword", detail: "예외 처리 시작" },
  { label: "catch", type: "keyword", detail: "예외 처리 블록" },
  { label: "finally", type: "keyword", detail: "예외 처리 종료 블록" },
  { label: "throw", type: "keyword", detail: "예외 발생" },
  { label: "throws", type: "keyword", detail: "예외 선언" },
  { label: "super", type: "keyword", detail: "부모 클래스 참조" },
  { label: "this", type: "keyword", detail: "현재 객체 참조" },
  { label: "enum", type: "keyword", detail: "열거형 정의" },
  { label: "return", type: "keyword", detail: "값 반환" },
  { label: "break", type: "keyword", detail: "루프 또는 switch 중단" },
  { label: "continue", type: "keyword", detail: "루프 다음 반복 실행" },
  { label: "if", type: "keyword", detail: "조건문" },
  { label: "else", type: "keyword", detail: "조건문의 대안" },
  { label: "for", type: "keyword", detail: "반복문 (일반)" },
  { label: "while", type: "keyword", detail: "반복문 (조건)" },
  { label: "do", type: "keyword", detail: "최소 1회 실행 반복문" },
  { label: "switch", type: "keyword", detail: "다중 조건문" },
  { label: "case", type: "keyword", detail: "조건문 옵션" },
  { label: "default", type: "keyword", detail: "조건문 기본값" },
  { label: "boolean", type: "type", detail: "논리 타입" },
  { label: "float", type: "type", detail: "부동소수점 타입" },
  { label: "double", type: "type", detail: "더블 타입" },
  { label: "long", type: "type", detail: "긴 정수 타입" },
  { label: "char", type: "type", detail: "문자 타입" },
  { label: "package", type: "keyword", detail: "패키지 정의" },
  { label: "private", type: "keyword", detail: "접근 제어자 (비공개)" },
  { label: "protected", type: "keyword", detail: "접근 제어자 (상속 및 동일 패키지)" },
  { label: "synchronized", type: "keyword", detail: "동기화 블록" },
  { label: "volatile", type: "keyword", detail: "변수 변경 방지" },
  { label: "instanceof", type: "keyword", detail: "객체 타입 확인" },
  { label: "assert", type: "keyword", detail: "디버깅용 조건 확인" },
  { label: "transient", type: "keyword", detail: "직렬화 제외 변수" },
  { label: "strictfp", type: "keyword", detail: "부동소수점 연산의 플랫폼 독립성 보장" },
  { label: "null", type: "literal", detail: "null 참조값" },
  { label: "true", type: "literal", detail: "참 논리값" },
  { label: "false", type: "literal", detail: "거짓 논리값" },
];


const getCompletionSource = (languageId: number) => {
  const completions = {
    71: pythonCompletions,
    50: cppCompletions,
    53: cppCompletions,
    62: javaCompletions,
  }[languageId];

  return autocompletion({
    override: [
      (context: CompletionContext) => {
        if (!completions) return null;
        const word = context.matchBefore(/\w*/);
        if (!word || (word.from === word.to && !context.explicit)) return null;
        return {
          from: word.from,
          options: completions,
        };
      },
    ],
  });
};

const getLinterExtension = (languageId: number) => {
  switch (languageId) {
    case 71:
      return linter(pythonLinter);
    case 50:
    case 53:
      return linter(cppLinter);
    case 62:
      return linter(javaLinter);
    default:
      return linter(pythonLinter);
  }
};

const getLanguageExtension = (languageId: number) => {
  switch (languageId) {
    case 71:
      return [python()];
    case 50:
    case 53:
      return [cpp()];
    case 62:
      return [java()];
    default:
      console.warn(`지원되지 않는 언어입니다 : ${languageId}`);
      return [python()];
  }
};


const lightTheme = EditorView.theme(
  {
    ".cm-activeLine": {
      backgroundColor: "transparent",
      border: "none",
    },
  },
  { dark: false }
);

const Editor: React.FC<EditorProps> = ({
  code,
  handleCodeChange,
  isDarkMode,
  selectedLanguage,
}) => {
  const [enableAI, setEnableAI] = useState(false);
  const [analysisResults, setAnalysisResults] = useState({
    timeComplexity: "결과 없음",
    spaceComplexity: "결과 없음",
    potentialIssues: "결과 없음",
    algorithmType: "결과 없음",
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showAnalysisPanel, setShowAnalysisPanel] = useState(true);

  useEffect(() => {
    console.log("언어 변경됨: ID =", selectedLanguage);
  }, [selectedLanguage]);

  // inlineCopilot 등록 (AI 자동완성)
  inlineCopilot(async (prefix, suffix) => {
    const response = await fetch(process.env.REACT_APP_CONCURRENCY_BACKEND_URL + "/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [{ role: "user", content: `${prefix}<FILL_ME>${suffix}` }],
        model: "gpt-3.5-turbo",
      }),
    });
    const { choices } = await response.json();
    return choices?.[0]?.message?.content || "";
  });

  // 코드 분석 (REST API 호출)
  const analyzeCode = async () => {
    try {
      setIsAnalyzing(true);
      console.log("코드 분석 요청:", code);
      const response = await fetch(process.env.REACT_APP_CONCURRENCY_BACKEND_URL + "/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language: selectedLanguage }),
      });
      if (!response.ok)
        throw new Error(`HTTP 오류! 상태: ${response.status}`);
      const data = await response.json();
      console.log("분석 결과:", data);
      const resultText: string = data.result;
      console.log("분석 결과 텍스트:", resultText);
      const timeComplexityMatch = resultText.match(/시간\s*복잡도:\s*(.+)/);
      const spaceComplexityMatch = resultText.match(/공간\s*복잡도:\s*(.+)/);
      const potentialIssuesMatch = resultText.match(/잠재적인\s*문제:\s*(.+)/);
      const algorithmTypeMatch = resultText.match(/알고리즘\s*유형:\s*(.+)/);
      const timeComplexity = timeComplexityMatch
        ? timeComplexityMatch[1].split("\n")[0].trim()
        : "N/A";
      const spaceComplexity = spaceComplexityMatch
        ? spaceComplexityMatch[1].split("\n")[0].trim()
        : "N/A";
      const potentialIssues = potentialIssuesMatch
        ? potentialIssuesMatch[1].split("\n")[0].trim()
        : "N/A";
      const algorithmType = algorithmTypeMatch
        ? algorithmTypeMatch[1].split("\n")[0].trim()
        : "Unknown";
      const formattedTimeComplexity =
        timeComplexity !== "N/A"
          ? timeComplexity.replace(/\\times/g, "×")
          : timeComplexity;
      const formattedSpaceComplexity =
        spaceComplexity !== "N/A"
          ? spaceComplexity.replace(/\\times/g, "×")
          : spaceComplexity;
      setAnalysisResults({
        timeComplexity: formattedTimeComplexity,
        spaceComplexity: formattedSpaceComplexity,
        potentialIssues,
        algorithmType,
      });
    } catch (error) {
      console.error("코드 분석 중 오류:", error);
      setAnalysisResults({
        timeComplexity: "오류",
        spaceComplexity: "오류",
        potentialIssues: "오류",
        algorithmType: "오류",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <>
      <style>{`
  .cm-content,
  .cm-scroller,
  .cm-editor,
  .cm-line {
    font-family: 'EditorFont', monospace !important;
    text-decoration: none !important;
    border: none !important;
    box-shadow: none !important;
    outline: none !important;
  }
      `}</style>
      <CollaborativeEditor
        code={code}
        handleCodeChange={handleCodeChange}
        isDarkMode={isDarkMode}
        selectedLanguage={selectedLanguage}
        enableAI={enableAI}
        analysisResults={analysisResults}
        isAnalyzing={isAnalyzing}
        showAnalysisPanel={showAnalysisPanel}
        setEnableAI={setEnableAI}
        setAnalysisResults={setAnalysisResults}
        setIsAnalyzing={setIsAnalyzing}
        setShowAnalysisPanel={setShowAnalysisPanel}
        analyzeCode={analyzeCode}
      />
    </>
  );
};

// CollaborativeEditor 컴포넌트 (동시 편집 및 collab) 

const CollaborativeEditor = React.memo((props: any) => {

  const [ydoc] = useState(new Y.Doc());
  const ytext = useMemo(() => ydoc.getText("codemirror"), [ydoc]);
  const editorViewRef = useRef<EditorView | null>(null);
  const [provider, setProvider] = useState<WebsocketProvider | null>(null);
  const [lintEnabled, setLintEnabled] = useState(false);

  const lintGutterCompartment = useMemo(() => new Compartment(), []);
  const lintCompartment = useMemo(() => new Compartment(), []);

  // 로컬 스토리지에서 이중 파싱으로 사용자 정보(닉네임, 색상) 가져오기
  const { userDisplayName, userColor, userProfileImageUrl } = useMemo(() => {
    let userDisplayName = "Guest";
    // 기본 랜덤 색상 생성
    const randomColor =
      "#" +
      Math.floor(Math.random() * 0xffffff)
        .toString(16)
        .padStart(6, "0");
    let userColor = randomColor;
    let userProfileImageUrl = ""; // 기본값은 빈 문자열 (없으면 AvatarStack에서 기본 이미지 처리)

    const persistedUserStr = localStorage.getItem("persist:persistedUser");
    if (persistedUserStr) {
      try {
        const persistedUser = JSON.parse(persistedUserStr);
        if (persistedUser.myInfo) {
          const myInfoObj = JSON.parse(persistedUser.myInfo);
          if (
            myInfoObj.nickname &&
            typeof myInfoObj.nickname === "string" &&
            myInfoObj.nickname.trim()
          ) {
            userDisplayName = myInfoObj.nickname.trim();
          }
          if (
            myInfoObj.color &&
            typeof myInfoObj.color === "string" &&
            myInfoObj.color.trim()
          ) {
            userColor = myInfoObj.color;
          }
          if (
            myInfoObj.profileImageUrl &&
            typeof myInfoObj.profileImageUrl === "string" &&
            myInfoObj.profileImageUrl.trim()
          ) {
            userProfileImageUrl = myInfoObj.profileImageUrl.trim();
          }
        }
      } catch (error) {
        console.error("persist:persistedUser 파싱 오류:", error);
      }
    }
    return { userDisplayName, userColor, userProfileImageUrl };
  }, []);

  // 에디터 DOM에 붙일 ref 콜백
  const editorRef = useCallback(
    (node: HTMLDivElement) => {
      if (!node) return;

      // 쿼리에서 roomId 추출
      function getRoomNameFromURL(): string {
        const params = new URLSearchParams(window.location.search);
        return params.get("roomId") || "default";
      }
      const roomName = getRoomNameFromURL();
      console.log("추출된 roomName:", roomName);

      // WebsocketProvider 생성 
      const wsProvider = new WebsocketProvider(
        process.env.REACT_APP_CONCURRENCY_BACKEND_WEBSOCKET_URL as string,
        roomName,
        ydoc
      );
      setProvider(wsProvider);

      // 로컬 사용자의 정보를 awareness에 등록 (이중 파싱한 값 사용)
      wsProvider.awareness.setLocalStateField("user", {
        name: userDisplayName,
        color: userColor,
        colorLight: userColor + "80",
        profileImageUrl: userProfileImageUrl,
      });


      // AI 자동완성을 위한 함수 (inlineCopilot에 사용)
      const aiCompletion = async (prefix: string, suffix: string) => {
        try {
          const response = await fetch(process.env.REACT_APP_CONCURRENCY_BACKEND_URL + "/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              messages: [
                { role: "user", content: `${prefix}<FILL_ME>${suffix}` },
              ],
              model: "gpt-3.5-turbo",
            }),
          });
          const data = await response.json();
          return data?.choices?.[0]?.message?.content || "";
        } catch (error) {
          console.error("AI 완성 오류:", error);
          return "";
        }
      };

      const extensions = [
        getLanguageExtension(props.selectedLanguage),
        getCompletionSource(props.selectedLanguage),
        yCollab(ytext, wsProvider.awareness),
        props.isDarkMode ? oneDark : lightTheme,
        props.enableAI ? inlineCopilot(aiCompletion) : [],
        EditorView.lineWrapping,
        keymap.of([indentWithTab]),
        basicSetup({ highlightActiveLine: false }),
        lintGutter(),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            props.handleCodeChange(update.state.doc.toString());
          }
        }),
        lintCompartment.of(
          lintEnabled ? getLinterExtension(props.selectedLanguage) : []
        ),
        lintGutterCompartment.of(
          lintEnabled ? lintGutter() : []
        ),
        props.isDarkMode ? oneDark : lightTheme,
      ];

      const view = new EditorView({
        state: EditorState.create({
          doc: ytext.toString(),
          extensions,
        }),
        parent: node,
      });
      editorViewRef.current = view;

      return () => {
        console.log("Cleanup: 컴포넌트 언마운트, awareness 상태 제거");
        wsProvider.awareness.setLocalState(null);
        view.destroy();
        wsProvider.destroy();
        ydoc.destroy();
      };
    },
    [
      props.selectedLanguage,
      props.enableAI,
      props.isDarkMode,
      lintEnabled,
      ytext,
      ydoc,
      props.handleCodeChange,
      userDisplayName,
      userColor,
    ]
  );

  // lintEnabled 옵션 변경 시 에디터 업데이트
  useEffect(() => {
    if (editorViewRef.current) {
      console.log(
        "lintEnabled 변경됨:",
        lintEnabled,
        "선택된 언어:",
        props.selectedLanguage
      );
      editorViewRef.current.dispatch({
        effects: [
          lintCompartment.reconfigure(
            lintEnabled ? getLinterExtension(props.selectedLanguage) : []
          ),
          lintGutterCompartment.reconfigure(
            lintEnabled ? lintGutter() : []
          ),
        ],
      });
      editorViewRef.current.dispatch({
        changes: { from: 0, to: 0, insert: "" },
      });
    }
  }, [lintEnabled, props.selectedLanguage]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (provider) {
        provider.awareness.setLocalState(null);
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [provider]);

  return (
    <div className="border border-gray-800 rounded overflow-visible transition-colors duration-500">
      <div className="flex items-center mb-2 p-4 bg-gray-100 dark:bg-gray-800 space-x-4">
        <button
          onClick={() => props.setEnableAI(!props.enableAI)}
          className={`px-4 py-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white font-bold rounded-lg shadow-md 
    hover:shadow-lg transform hover:scale-105 active:scale-95 transition-all duration-300
    ${props.enableAI ? "rainbow-border" : ""}`}
        >
          {props.enableAI ? "🤖 AI 자동완성 켜짐" : "🤖 AI 자동완성 꺼짐"}
        </button>

        <button
          onClick={props.analyzeCode}
          disabled={props.isAnalyzing}
          className={`px-4 py-2 bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-lg shadow-md ${props.isAnalyzing ? "opacity-50 cursor-not-allowed" : ""
            }`}
        >
          {props.isAnalyzing ? "🔍 분석 중..." : "📊 코드 분석"}
        </button>
        <button
          onClick={() => props.setShowAnalysisPanel(!props.showAnalysisPanel)}
          className="px-4 py-2 bg-gradient-to-r from-gray-600 to-gray-800 text-white rounded-lg shadow-md"
        >
          {props.showAnalysisPanel ? "📂 패널 숨기기" : "📂 패널 보기"}
        </button>
        <button
          onClick={() => {
            setLintEnabled((prev) => !prev);
          }}
          className={`px-4 py-2 text-white rounded-lg shadow-md transition-colors ${lintEnabled ? "bg-red-700" : "bg-gray-400"
            }`}
        >
          {lintEnabled
            ? "🚨 문법 검사 켜짐"
            : "🚨 문법 검사 꺼짐"}
        </button>
        <button
          onClick={() => navigator.clipboard.writeText(props.code)}
          className="ml-auto p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
        >
          <Copy className="h-5 w-5 text-gray-600 dark:text-gray-300" />
        </button>
        {provider && <AvatarStackCollab provider={provider} />}
      </div>
      {props.showAnalysisPanel && (
        <div className="p-4 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-2 dark:text-white">
            🧠 AI 분석 결과
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <p className="font-medium dark:text-gray-300">⏳ 시간 복잡도:</p>
              <p className="dark:text-gray-400">
                {props.analysisResults.timeComplexity}
              </p>
            </div>
            <div className="space-y-1">
              <p className="font-medium dark:text-gray-300">💾 공간 복잡도:</p>
              <p className="dark:text-gray-400">
                {props.analysisResults.spaceComplexity}
              </p>
            </div>
            <div className="space-y-1">
              <p className="font-medium dark:text-gray-300">⚠️ 잠재적 문제:</p>
              <p className="dark:text-gray-400">
                {props.analysisResults.potentialIssues}
              </p>
            </div>
            <div className="space-y-1">
              <p className="font-medium dark:text-gray-300">🔧 알고리즘 유형:</p>
              <p className="dark:text-gray-400">
                {props.analysisResults.algorithmType}
              </p>
            </div>
          </div>
        </div>
      )}
      <div
        ref={editorRef}
        className="h-[600px] w-full overflow-auto"
        style={{ backgroundColor: props.isDarkMode ? "#282c34" : "#fff" }}
      />
    </div>
  );
});

export default Editor;
