import React, {
  useState,
  KeyboardEvent,
  ChangeEvent,
  useRef,
  useEffect,
} from "react";

export interface ChatMessage {
  userId: number;
  nickname: string;
  message: string;
}

interface ChatComponentProps {
  onSendMessage: (message: string) => void;
  messages: ChatMessage[];
  currentUserId: number;
  isDarkMode?: boolean; // 다크모드 여부 (기본값은 false)
}

const ChatComponent: React.FC<ChatComponentProps> = ({
  onSendMessage,
  messages,
  currentUserId,
  isDarkMode = false,
}) => {
  const [newMessage, setNewMessage] = useState<string>("");
  const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);

  // 메시지 영역에 대한 ref
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // messages가 변경될 때마다 스크롤을 맨 아래로 이동
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // 엔터키를 누르면 메시지 전송 (Shift+Enter는 줄바꿈)
  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && newMessage.trim()) {
      e.preventDefault();
      sendMessage();
    }
  };

  // 입력값 변경 시, 자동 높이 조절 기능 추가
  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setNewMessage(e.target.value);
    e.target.style.height = "auto"; // 높이 초기화
    e.target.style.height = `${e.target.scrollHeight}px`; // 내용에 맞춰 높이 재설정
  };

  const sendMessage = () => {
    if (newMessage.trim()) {
      onSendMessage(newMessage);
      setNewMessage("");
      setShowEmojiPicker(false);
    }
  };

  const toggleEmojiPicker = () => {
    setShowEmojiPicker((prev) => !prev);
  };

  const handleEmojiClick = (emoji: string) => {
    setNewMessage((prev) => prev + emoji);
  };

  const emojiList = ["😊", "😂", "😍", "😎", "😢", "👍", "👎", "🎉", "🔥", "🤔"];

  return (
    <div
      className={`chatbot-body flex flex-col h-full relative transition-colors duration-300 ${
        isDarkMode ? "bg-gray-900 text-white" : "bg-white text-black"
      }`}
    >
      {/* 메시지 영역 */}
      <div
        ref={messagesContainerRef} // 메시지 컨테이너에 ref 할당
        className={`messages flex-1 overflow-y-auto p-2 transition-colors duration-300 ${
          isDarkMode ? "bg-gray-800" : "bg-gray-100"
        }`}
      >
        {messages.map((msg, index) => {
          const isMine = msg.userId === currentUserId;
          const justify = isMine ? "justify-end" : "justify-start";
          const bubbleClasses = isMine
            ? isDarkMode
              ? "bg-gray-700 text-white"
              : "bg-gray-200 text-gray-800"
            : isDarkMode
            ? "bg-gray-600 text-white"
            : "bg-yellow-400 text-black";
          return (
            <div key={index} className={`flex ${justify} my-2`}>
              <div
                className={`message-bubble max-w-full px-4 py-2 rounded-2xl shadow ${bubbleClasses}`}
              >
                <span className="font-bold mr-2">{msg.nickname}:</span>
                <span className="whitespace-pre-wrap break-words">
                  {msg.message}
                </span>
              </div>
            </div>
          );
        })}
        {/* 스크롤 위치를 강제로 맨 아래로 이동시키기 위한 div */}
        <div ref={messagesEndRef} />
      </div>

      {/* 입력 영역 */}
      <div
        className={`input-container flex items-center p-2 border-t transition-colors duration-300 ${
          isDarkMode ? "border-gray-700" : "border-gray-300"
        }`}
      >
        <button
          className="emoji-button text-2xl mr-2"
          onClick={toggleEmojiPicker}
        >
          😊
        </button>
        <textarea
          value={newMessage}
          onChange={handleChange}
          onKeyPress={handleKeyPress}
          placeholder="메시지를 입력하세요.."
          className={`flex-1 px-4 py-2 rounded-full outline-none transition-colors duration-300 focus:ring focus:ring-blue-300 resize-y ${
            isDarkMode
              ? "bg-gray-900 text-white border border-gray-700"
              : "bg-gray-100 text-black border border-gray-300"
          }`}
          style={{ minHeight: "25px" }} // 최소 높이를 25px로 지정
        />
        <button
          className="send-button ml-2 bg-yellow-500 rounded-full p-2 text-white transition-colors duration-300 hover:bg-yellow-600"
          onClick={sendMessage}
        >
          ➤
        </button>
      </div>

      {/* 이모지 선택기 */}
      {showEmojiPicker && (
        <div
          className={`emoji-picker absolute bottom-16 left-2 p-2 flex flex-wrap rounded-lg shadow-lg transition-colors duration-300 ${
            isDarkMode
              ? "bg-gray-800 border border-gray-600"
              : "bg-white border border-gray-300"
          }`}
          style={{ width: "220px" }}
        >
          {emojiList.map((emoji, index) => (
            <span
              key={index}
              className="text-2xl m-1 cursor-pointer"
              onClick={() => handleEmojiClick(emoji)}
            >
              {emoji}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default ChatComponent;
