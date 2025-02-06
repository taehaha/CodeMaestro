// src/components/Chat.tsx
// 깡통 껍데기 임시로 만든 채팅임 신경 XXXXXXX openvidu로 구현 시 다 바꿀 것임 
import React, { useState } from "react";

interface Message {
  id: number;
  author: string;      
  text: string;         
  isUser: boolean;     
}
// 깡통 껍데기 임시로 만든 채팅임 신경 XXXXXXX openvidu로 구현 시 다 바꿀 것임 
const Chat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, author: "사용자1", text: "다들 2580번 문제 풀어보세요!", isUser: true },
    { id: 2, author: "사용자1", text: "모르는거 있으시면 뭐든 물어보세요", isUser: true },
    {
      id: 3,
      author: "사용자2",
      text: "dfs를 사용해서 구현하려고 하는데 왜 모두 0으로 넣었을 때 답이 안 나올까요??",
      isUser: false
    },
    {
      id: 4,
      author: "사용자1",
      text: "그 부분이 좀 헷갈릴 수 있어요! ...",
      isUser: true
    },
  ]);

  // 참여자(예시)
  const participants = ["사용자1", "사용자2", "사용자3"];

  // 입력창
  const [inputValue, setInputValue] = useState<string>("");

  // 메시지 전송 핸들러
  const handleSend = () => {
    if (!inputValue.trim()) return;

    const newMessage: Message = {
      id: Date.now(),
      author: "사용자1", 
      text: inputValue,
      isUser: true,
    };

    setMessages([...messages, newMessage]);
    setInputValue("");
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="p-2 border-b border-gray-300 dark:border-gray-700">
        <h2 className="font-bold mb-1">참여자 목록</h2>
        <div className="flex flex-wrap gap-2">
          {participants.map((p, idx) => (
            <span
              key={idx}
              className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm"
            >
              {p}
            </span>
          ))}
        </div>
      </div>

      {/* 채팅 메시지 영역 */}
      <div className="flex-grow overflow-auto p-4 space-y-2">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.isUser ? "justify-end" : "justify-start"}`}>
            <div
              className={`
                max-w-xs px-3 py-2 rounded-lg text-sm shadow
                ${msg.isUser ? "bg-yellow-300 text-right" : "bg-gray-200 dark:bg-gray-700"}
              `}
            >
              <div className="font-bold mb-1">{msg.author}</div>
              <div>{msg.text}</div>
            </div>
          </div>
        ))}
      </div>

      {/* 메시지 입력창 */}
      <div className="p-2 border-t border-gray-300 dark:border-gray-700 flex items-center">
        <input
          type="text"
          className="
            flex-grow
            p-2 border border-gray-300 dark:border-gray-600
            rounded mr-2
            bg-white dark:bg-gray-800
            text-black dark:text-white
          "
          placeholder="메시지를 입력하세요."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
        <button
          className="px-4 py-2 bg-blue-500 dark:bg-blue-700 text-white rounded"
          onClick={handleSend}
        >
          전송
        </button>
      </div>
    </div>
  );
};

export default Chat;
