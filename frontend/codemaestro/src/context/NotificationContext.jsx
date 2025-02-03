import { createContext, useEffect, useState } from "react";
import { EventSourcePolyfill } from "event-source-polyfill";
import tokenStorage from "../utils/tokenstorage";
import { useSelector } from "react-redux";
import PropTypes from "prop-types";
import { getNotification } from "../api/AuthApi";

export const NotificationsContext = createContext();

export const NotificationsProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const token = tokenStorage.getAccessToken()
  const user = useSelector((state) => state.user.myInfo); 
  console.log(user);
  
  const isLoggedIn = useSelector((state) => state.user.isLoggedIn); 
  
  useEffect(() => {
    // 브라우저 알림 권한 요청
    if (Notification.permission !== "granted") {
      Notification.requestPermission().then((permission) => {
        if (permission !== "granted") {
          console.error("알림 권한이 거부되었습니다.");
        }
      });
    }})


  // useEffect(() => {

  //   const fetchInitialData = async () => {
  //     try {
  //       // 예: 기존 알림, 대기중인 친구 요청, 그룹 목록 등 불러오기
  //       const initialNotifications = await getNotification()
  //       setNotifications(initialNotifications.data);
  //     } catch (error) {
  //       console.error("Failed to fetch initial notifications:", error);
  //     }
  //   };


  //   if ( isConnected || isLoggedIn || !token ) 
  //     {
  //       return;} // 이미 연결된 경우 다시 연결하지 않음

  //   // SSE 연결 설정  
  //   fetchInitialData()  
  //   const eventSource = new EventSourcePolyfill(`https://codemaestro.site/api/subscribe/${user?.id}`, {
  //     headers: {
  //       Authorization: `Access ${token}`, // JWT 토큰
  //     },
  //   });

  //   eventSource.onmessage = (event) => {
  //     const data = JSON.parse(event.data);
      
  //     setNotifications((prev) => {
  //       if (prev.some((n) => n.request === data.request)) {
  //         return prev;
  //       }
  //       return [...prev, data];
  //     });

  //     if (Notification.permission === "granted") {
  //       new Notification(data.type === "friend" ? "친구 요청" : "회의 초대", {
  //         body: `${data.name}님이 ${data.type === "friend" ? "친구 요청을 보냈습니다." : "회의에 초대했습니다."}`,
  //       });
  //     }
  //   };
  //   eventSource.onerror = () => {
  //     console.error("SSE connection error");
  //     eventSource.close();
  //     // 5초 후 재연결 시도
  //     setTimeout(() => {
  //       console.log("Retrying SSE connection...");
  //       setIsConnected(false); 
  //       // isConnected를 false로 두면, 상위 useEffect에서 다시 연결 시도 가능
  //     }, 5000);
  //   };

  //   setIsConnected(true);

  //   return () => {
  //     eventSource.close();
  //     setIsConnected(false);
  //   };
  // }, [isConnected, token]);

  return (
    <NotificationsContext.Provider value={{ notifications }}>
      {children}
    </NotificationsContext.Provider>
  );
  
};

NotificationsProvider.propTypes = {
  children: PropTypes.node.isRequired, // children은 반드시 전달되어야 함
};
