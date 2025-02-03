import { createContext, useEffect, useState, useRef } from "react";
import { EventSourcePolyfill } from "event-source-polyfill";
import tokenStorage from "../utils/tokenstorage";
import { useSelector } from "react-redux";
import PropTypes from "prop-types";
import { getNotification } from "../api/AuthApi";

export const NotificationsContext = createContext();

export const NotificationsProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const eventSourceRef = useRef(null);

  // token, 사용자 정보, 로그인 상태
  const token = tokenStorage.getAccessToken();
  const user = useSelector((state) => state.user.myInfo);
  const isLoggedIn = useSelector((state) => state.user.isLoggedIn);


  useEffect(() => {
    // 토큰, 로그인 상태, 사용자 id가 없으면 SSE 연결하지 않음
    if (!token || !isLoggedIn || !user?.userId) {
      return;
    }

    // 초기 알림 데이터 fetch
    const fetchInitialData = async () => {
      try {
        const initialNotifications = await getNotification(user.userId);
        setNotifications(initialNotifications.data);
      } catch (error) {
        console.error("Failed to fetch initial notifications:", error);
      }
    };
    fetchInitialData();

    // SSE 연결 설정 (EventSourcePolyfill 사용, URL에 사용자 id 포함)
    const url = `http://192.168.31.58:8080/subscribe/${user.userId}`;
    const eventSource = new EventSourcePolyfill(url, {
      headers: {Access:`${token}`},
    });

    // eventSource를 ref에 저장 (추후 cleanup 용도)
    eventSourceRef.current = eventSource;

    // 이벤트 리스너 등록
    eventSource.addEventListener("connect", (event) => {
      console.log(event);
      
      console.log("연결됨:", event.data);
    });

    eventSource.addEventListener("lost-data", (event) => {
      console.log("미수신 데이터 수신:", event.data);
    });

    eventSource.addEventListener("notification", (event) => {
      console.log("새로운 알림:", event.data);
    });

    // 기본 onmessage 이벤트 핸들러 등록
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setNotifications((prev) => {
          // 기존 알림에 같은 request 값이 있으면 업데이트하지 않음
          if (prev.some((n) => n.request === data.request)) {
            return prev;
          }
          return [...prev, data];
        });
      } catch (error) {
        console.error("메시지 처리 오류:", error);
      }
    };

    // 에러 발생 시 처리 및 필요 시 재연결 로직 구현 가능
    eventSource.onerror = (error) => {
      console.error("SSE connection error:", error);
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      // 필요하다면 재연결 로직(예: setTimeout)을 구현할 수 있습니다.
    };

    // cleanup: 컴포넌트 언마운트 또는 의존성 변경 시 SSE 연결 종료
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [token, isLoggedIn, user?.userId]);

  return (
    <NotificationsContext.Provider value={{ notifications }}>
      {children}
    </NotificationsContext.Provider>
  );
};

NotificationsProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
