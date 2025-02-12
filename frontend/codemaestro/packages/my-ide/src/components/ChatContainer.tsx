// ChatContainer.tsx
import React, { useEffect, useState } from 'react';
import ChatComponent, { ChatMessage } from './ChatComponent';
import OpenviduClient from '../OpenviduClient'; // 실제 파일 경로에 맞게 수정하세요.
import tokenStorage from "my-code/src/utils/tokenstorage";

const ChatContainer: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [openviduClient, setOpenviduClient] = useState<OpenviduClient | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  useEffect(() => {
    // OpenVidu 서버 및 인증 정보 설정
    const HOST_URL = new URL("http://192.168.31.194:8080");
    const ACCESS_TOKEN = tokenStorage.getAccessToken() || "";
    const conferenceId = 12345; // 실제 회의실 번호
    const accessCode = 1234;    // 실제 accessCode 값 (회의실 비밀번호 등)

    // OpenviduClient 인스턴스 생성
    const client = new OpenviduClient(HOST_URL, ACCESS_TOKEN, conferenceId);
    setOpenviduClient(client);

    // 채팅 메시지 수신 콜백 설정
    client.setMessageReceivedCallback((userId: number, nickname: string, message: string) => {
      setMessages(prev => [...prev, { userId, nickname, message }]);
    });

    // 연결 초기화 후, connectionData를 통해 현재 사용자 ID를 받아오기
    client.initConnection(accessCode, true, true)
      .then(() => {
        // 연결이 완료되면 getMyUserId()를 사용하여 현재 사용자 ID를 설정
        if (client.getMyUserId) {
          const myId = client.getMyUserId();
          setCurrentUserId(myId);
        } else {
          console.error("현재 사용자 ID를 가져올 수 없습니다. 기본값 0을 사용합니다.");
          setCurrentUserId(0);
        }
      })
      .catch(err => console.error("연결에 실패했습니다.", err));

    // 컴포넌트 언마운트 시 연결 종료
    return () => {
      client.disconnect();
    };
  }, []);

  // currentUserId가 아직 설정되지 않았다면 로딩 상태를 표시
  if (currentUserId === null) {
    return <div>로딩 중...</div>;
  }

  // ChatComponent에서 메시지 송신 요청을 받으면 OpenviduClient를 통해 메시지 전송
  const handleSendMessage = (message: string) => {
    if (openviduClient) {
      openviduClient.sendMessage(message);
    }
  };

  return (
    <div>
      <ChatComponent
        onSendMessage={handleSendMessage}
        messages={messages}
        currentUserId={currentUserId}
      />
    </div>
  );
};

export default ChatContainer;
