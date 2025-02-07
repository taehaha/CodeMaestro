import React, { createContext, useEffect, useState, useRef } from "react";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import { EventSourcePolyfill } from "event-source-polyfill";
import tokenStorage from "../utils/tokenstorage";
import { baseURL } from "../api/userAxios";

// 알림 Context 생성
export const NotificationsContext = createContext();

// 임시 알림 데이터 (예시)
const dummyNotifications = [
  {
    type: "friend",
    userName: "Alice",
    message: "Alice님이 친구 요청을 보냈습니다.",
    request: 101,
  },
  {
    type: "group",
    groupName: "Developers Group",
    message: "Developers Group에 초대되었습니다.",
    request: 102,
  },
  {
    type: "invite",
    name: "Weekly Meeting",
    request: 103,
    roomId: "meeting-001",
  },
];

export const NotificationsProvider = ({ children }) => {
  const [notifications, setNotifications] = useState(dummyNotifications);
  const eventSourceRef = useRef(null);
  // 마지막으로 사용한 토큰과 userId를 저장해 불필요한 재연결을 방지
  const prevCredentialsRef = useRef({ token: null, userId: null });

  // Redux로부터 userId를 가져오고, tokenStorage에서 토큰을 가져옵니다.
  const userId = useSelector((state) => state.user.myInfo?.userId);
  const token = tokenStorage.getAccessToken();

  // 알림 추가 함수
  const addNotification = (type, data) => {
    setNotifications((prev) => [...prev, { type, data }]);
  };

  // SSE 연결 해제 및 unsubscribe API 호출 (Fetch API 사용)
  const disconnect = async () => {
    try {
      const currentToken = await tokenStorage.getAccessToken();
      const response = await fetch(`${baseURL}/unsubscribe/${userId}`, {
        method: "GET", // 서버 요구사항에 맞게 GET 또는 POST로 변경
        headers: {
          Access: currentToken, // 필요한 경우 "Authorization": `Bearer ${currentToken}` 등으로 수정
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        const errorText = await response.text();
        console.error("unsubscribe 에러:", response.status, errorText);
      } else {
        const result = await response.json();
        console.log("unsubscribe 성공:", result);
      }
    } catch (error) {
      console.error("unsubscribe 에러:", error);
    } finally {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        console.log("SSE 연결 종료됨");
      }
    }
  };

  // SSE 연결 생성 함수
  const connect = () => {
    const url = `${baseURL}/subscribe/${userId}`;

    // 기존 연결이 있으면 종료
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const es = new EventSourcePolyfill(url, {
      headers: { Access: token },
      heartbeatTimeout: 120000,
    });

    // 연결 성공 이벤트
    es.addEventListener("connect", (event) => {
      console.log("연결됨:", event.data);
    });

    // lost-data 이벤트 처리
    es.addEventListener("lost-data", (event) => {
      let parsedData;
      try {
        parsedData = JSON.parse(event.data);
      } catch {
        parsedData = event.data;
      }
      if (parsedData.groupId) {
        addNotification("group", parsedData);
      } else if (parsedData.userName) {
        addNotification("friend", parsedData);
      } else {
        addNotification("invite", parsedData);
      }
    });

    // friendRequest 이벤트 처리
    es.addEventListener("friendRequest", (event) => {
      let parsedData;
      try {
        parsedData = JSON.parse(event.data);
      } catch {
        parsedData = event.data;
      }
      addNotification("friend", parsedData);
    });

    // groupRequest 이벤트 처리
    es.addEventListener("groupRequest", (event) => {
      let parsedData;
      try {
        parsedData = JSON.parse(event.data);
      } catch {
        parsedData = event.data;
      }
      console.log("groupRequest 이벤트 데이터:", parsedData);
      addNotification("group", parsedData);
    });

    // invite 이벤트 처리
    es.addEventListener("invite", (event) => {
      let parsedData;
      try {
        parsedData = JSON.parse(event.data);
      } catch {
        parsedData = event.data;
      }
      console.log("invite 이벤트 데이터:", parsedData);
      addNotification("invite", parsedData);
    });

    // 개선된 onerror 핸들러: 
    // 'ERR_INCOMPLETE_CHUNKED_ENCODING' 또는 'network error' 관련 오류는 무시하도록 합니다.
    es.onerror = (event) => {
      const errorMessage = event?.error?.message || "";
      if (
        errorMessage.includes("ERR_INCOMPLETE_CHUNKED_ENCODING") ||
        errorMessage.includes("network error")
      ) {
        // 해당 오류는 무시 (필요 시 console.warn으로 간단한 로그만 남길 수 있음)
        return;
      }
      console.error("SSE 연결 오류:", event);
    };

    eventSourceRef.current = es;
  };

  // token 또는 userId가 변경되면 SSE 연결을 재설정합니다.
  useEffect(() => {
    if (!token || !userId) return;

    if (
      eventSourceRef.current &&
      prevCredentialsRef.current.token === token &&
      prevCredentialsRef.current.userId === userId
    ) {
      return;
    }
    prevCredentialsRef.current = { token, userId };

    connect();

    // 컴포넌트 언마운트 시 SSE 연결 해제
    return () => {
      if (eventSourceRef.current) {
        disconnect();
        eventSourceRef.current = null;
      }
    };
  }, [token, userId]);

  return (
    <NotificationsContext.Provider value={{ notifications, setNotifications }}>
      {children}
    </NotificationsContext.Provider>
  );
};

NotificationsProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default NotificationsProvider;
