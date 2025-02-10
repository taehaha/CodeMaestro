import { createContext, useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import PropTypes from "prop-types";
import { EventSourcePolyfill } from "event-source-polyfill";
import tokenStorage from "../utils/tokenstorage";
import UserAxios from "../api/userAxios";

// 알림 관련 Context 생성
export const NotificationsContext = createContext();

/**
 * NotificationsProvider 컴포넌트
 * SSE 연결을 통해 실시간 알림을 받아오고, 전역 상태로 관리합니다.
 */
const dummyNotifications = [
  {
    type: "friend",
    userName: "Alice",
    message: "Alice님이 친구 요청을 보냈습니다.",
    request: 101, // 친구 요청 고유 ID (예시)
  },
  {
    type: "group",
    groupName: "Developers Group",
    message: "Developers Group에 초대되었습니다.",
    request: 102, // 그룹 요청 고유 ID (예시)
  },
  {
    type: "invite",
    name: "Weekly Meeting",
    request: 103, // 회의 초대 고유 ID (예시)
    roomId: "meeting-001", // 초대받은 회의실 ID
  },
];



export const NotificationsProvider = ({ children }) => {
  // 알림 데이터를 저장할 상태
  const [notifications, setNotifications] = useState(dummyNotifications);
  // EventSource 인스턴스를 저장할 ref
  const eventSourceRef = useRef(null);
  // 사용자 토큰, 사용자 정보 가져오기
  const token = tokenStorage.getAccessToken();
  const userId = useSelector((state) => state.user.myInfo?.userId);

  // 알림을 추가하는 헬퍼 함수 (functional update 사용)
  const addNotification = (type, data) => {
    setNotifications((prevNotifications) => [
      ...prevNotifications,
      { type, data },
    ]);
  };

  // disconnect 함수: unsubscribe API 호출 후 SSE 연결 종료
  const disconnect = () => {
    // unsubscribe API 호출: 성공 여부와 관계없이 마지막에 SSE 연결 종료
    UserAxios(`/unsubscribe/${userId}`)
      .then((result) => {
        console.log("unsubscribe 성공:", result);
      })
      .catch((error) => {
        console.error("unsubscribe 에러:", error);
      })
      .finally(() => {
        if (eventSourceRef.current) {
          eventSourceRef.current.close();
          console.log("SSE 연결 종료됨");
        }
      });
  };

  // useEffect(() => {
  //   if (!token || !userId) {
  //     return;
  //   }

  //   // SSE 연결 생성 함수
  //   const connect = () => {
  //     const url = `http://192.168.31.58:8080/subscribe/${userId}`;

  //     // 기존 연결이 있다면 종료
  //     if (eventSourceRef.current) {
  //       eventSourceRef.current.close();
  //     }

  //     // 새 EventSourcePolyfill 인스턴스 생성
  //     const newEventSource = new EventSourcePolyfill(url, {
  //       headers: { Access: token },
  //       heartbeatTimeout: 120000,
  //     });

  //     // 이벤트 핸들러 등록
  //     newEventSource.addEventListener("connect", (event) => {
  //       console.log("연결됨:", event.data);
  //     });

  //     // lost-data 이벤트: 데이터 형식에 따라 알림 구분 처리
  //     newEventSource.addEventListener("lost-data", (event) => {
  //       // 예를 들어, event.data가 문자열 형태라면 JSON.parse가 필요할 수 있음
  //       let parsedData;
  //       try {
  //         parsedData = JSON.parse(event.data);
  //       } catch {
  //         parsedData = event.data;
  //       }

  //       if (parsedData.groupId) {
  //         addNotification("group", parsedData);
  //       } else if (parsedData.userName) {
  //         addNotification("friend", parsedData);
  //       } else {
  //         addNotification("invite", parsedData);
  //       }
  //     });

  //     // friendRequest 이벤트
  //     newEventSource.addEventListener("friendRequest", (event) => {
  //       let parsedData;
  //       try {
  //         parsedData = JSON.parse(event.data);
  //       } catch {
  //         parsedData = event.data;
  //       }
  //       addNotification("friend", parsedData);
  //     });

  //     // groupRequest 이벤트
  //     newEventSource.addEventListener("groupRequest", (event) => {
  //       let parsedData;
  //       try {
  //         parsedData = JSON.parse(event.data);
  //       } catch {
  //         parsedData = event.data;
  //       }
  //       addNotification("group", parsedData);
  //     });

  //     // invite 이벤트
  //     newEventSource.addEventListener("invite", (event) => {
  //       let parsedData;
  //       try {
  //         parsedData = JSON.parse(event.data);
  //       } catch {
  //         parsedData = event.data;
  //       }
  //       addNotification("invite", parsedData);
  //     });

  //     newEventSource.onerror = (error) => {
  //       console.error("SSE 연결 오류:", error);
  //       // 필요시 재연결 로직을 추가할 수 있음
  //     };

  //     // 새 인스턴스를 ref에 저장
  //     eventSourceRef.current = newEventSource;
  //   };

  //   // SSE 연결 생성
  //   connect();

  //   // cleanup: 컴포넌트 언마운트 시 disconnect 호출하여 unsubscribe 및 연결 종료
  //   return () => {
  //     if (eventSourceRef.current) {
  //       disconnect();
  //     }
  //   };
  // }, [token, userId]);

  return (
    <NotificationsContext.Provider value={{ notifications,setNotifications }}>
      {children}
    </NotificationsContext.Provider>
  );
};

NotificationsProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
