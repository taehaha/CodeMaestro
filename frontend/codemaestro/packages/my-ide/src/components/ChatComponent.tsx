import React, { useState, KeyboardEvent, ChangeEvent } from "react";

export interface ChatMessage {
  userId: number;
  nickname: string;
  message: string;
}

interface ChatComponentProps {
  onSendMessage: (message: string) => void;
  messages: ChatMessage[];
  currentUserId: number; // 현재 사용자의 id (내 id)
}

const ChatComponent: React.FC<ChatComponentProps> = ({
  onSendMessage,
  messages,
  currentUserId,
}) => {
  const [newMessage, setNewMessage] = useState<string>("");
  const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && newMessage.trim()) {
      sendMessage();
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
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
      className="chatbot-body"
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        position: "relative",
      }}
    >
      {/* 메시지 영역 */}
      <div className="messages" style={{ flex: 1, overflowY: "auto", padding: "10px" }}>
        {messages.map((msg, index) => {
          // 현재 사용자의 id와 비교하여 내 메시지인지 판단
          const isMine = msg.userId === currentUserId;
          // 내 메시지는 오른쪽, 상대 메시지는 왼쪽 정렬
          const justify = isMine ? "flex-end" : "flex-start";
          // 내 메시지: 회색 계열, 상대 메시지: 노란색 (#FFCC00)
          const bubbleStyle = isMine
            ? {
                background: "#e0e0e0",
                color: "#333333",
                borderBottomRightRadius: 0,
              }
            : {
                background: "#FFCC00",
                color: "#000000",
                borderTopLeftRadius: 0,
              };

          return (
            <div
              key={index}
              className={isMine ? "user" : "bot"}
              style={{ margin: "10px 0", display: "flex", justifyContent: justify }}
            >
              <div
                className="message-bubble"
                style={{
                  maxWidth: "100%",
                  padding: "10px 15px",
                  borderRadius: "20px",
                  fontSize: "14px",
                  lineHeight: 1.4,
                  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                  overflowX: "auto",
                  overflowY: "hidden",
                  ...bubbleStyle,
                }}
              >
                <span
                  className="sender-label"
                  style={{ fontWeight: "bold", marginRight: "5px" }}
                >
                  {msg.nickname}:
                </span>
                <span
                  className="message-text"
                  style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
                >
                  {msg.message}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 입력 영역 */}
      <div
        className="input-container"
        style={{ display: "flex", alignItems: "center", padding: "10px" }}
      >
        <button
          className="emoji-button"
          onClick={toggleEmojiPicker}
          style={{
            background: "transparent",
            border: "none",
            fontSize: "20px",
            cursor: "pointer",
            marginRight: "10px",
          }}
        >
          😊
        </button>

        <input
          type="text"
          value={newMessage}
          onChange={handleChange}
          onKeyPress={handleKeyPress}
          placeholder="메시지를 입력하세요.."
          style={{
            flex: 1,
            padding: "10px 15px",
            border: "1px solid #cccccc",
            borderRadius: "20px",
            fontSize: "14px",
            outline: "none",
            background: "rgba(247,247,247,0.9)",
          }}
        />

        <button
          className="send-button"
          onClick={sendMessage}
          style={{
            background: "#FFCC00",
            border: "none",
            borderRadius: "50%",
            padding: "10px",
            width: "40px",
            height: "40px",
            cursor: "pointer",
            marginLeft: "10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "background-color 0.3s ease, transform 0.2s ease",
          }}
        >
          <span
            className="arrow-icon"
            style={{ fontSize: "16px", color: "#ffffff" }}
          >
            ➤
          </span>
        </button>
      </div>

      {/* 이모지 선택기 */}
      {showEmojiPicker && (
        <div
          className="emoji-picker"
          style={{
            position: "absolute",
            bottom: "60px",
            left: "10px",
            background: "#ffffff",
            border: "1px solid #ccc",
            borderRadius: "5px",
            padding: "10px",
            display: "flex",
            flexWrap: "wrap",
            width: "220px",
            zIndex: 1001,
          }}
        >
          {emojiList.map((emoji, index) => (
            <span
              key={index}
              style={{ fontSize: "20px", margin: "5px", cursor: "pointer" }}
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
