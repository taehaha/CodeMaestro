import { createContext, useEffect, useState } from "react";
import { EventSourcePolyfill } from "event-source-polyfill";
import tokenStorage from "../utils/tokenstorage";
import { useSelector } from "react-redux";

export const NotificationsContext = createContext();

export const NotificationsProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([
    { request:2, type: "invite", id: "user123", name: "초대자 A", roomId:"A65z5"},
    { request:3, type: "friend", id: "user456", name: "친구 요청자 B" },
    { request:4, type: "friend", id: "user436", name: "친구 요청자 C" },
  ]);
  const [isConnected, setIsConnected] = useState(false);
  const token = tokenStorage.getAccessToken()
  const user = useSelector((state) => state.user.myInfo); 
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


  useEffect(() => {
    if ( isConnected || !isLoggedIn || !token ) 
      {
        return;} // 이미 연결된 경우 다시 연결하지 않음
    // SSE 연결 설정    
    const eventSource = new EventSourcePolyfill(`https://codemaestro.site/api/subscribe/${user.id}`, {
      headers: {
        Authorization: `Bearer ${token}`, // JWT 토큰
      },
    });

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setNotifications((prev) => [...prev, data]); // 알림 저장

      if (Notification.permission === "granted") {
        new Notification(data.type === "friend" ? "친구 요청" : "회의 초대", {
          body: `${data.name}님이 ${data.type === "friend" ? "친구 요청을 보냈습니다." : "회의에 초대했습니다."}`,
          icon: "/path-to-your-icon.png", // 아이콘 이미지 경로
        });
      }
    };

    eventSource.onerror = () => {
      console.error("SSE connection error");
      eventSource.close();
    };

    setIsConnected(true);

    return () => {
      eventSource.close();
      setIsConnected(false);
    };
  }, [isConnected, token]);

  return (
    <NotificationsContext.Provider value={{ notifications }}>
      {children}
    </NotificationsContext.Provider>
  );
};
