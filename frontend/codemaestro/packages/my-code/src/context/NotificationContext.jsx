import React, { createContext, useEffect, useState, useRef } from "react";
import PropTypes from "prop-types";
import { useSelector, shallowEqual } from "react-redux";
import { EventSourcePolyfill } from "event-source-polyfill";
import tokenStorage from "../utils/tokenstorage";
import { baseURL } from "../api/userAxios";

// 알림 Context 생성
export const NotificationsContext = createContext();

export const NotificationsProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const eventSourceRef = useRef(null);
  // 이전 토큰과 사용자 ID를 저장해 불필요한 재연결을 방지합니다.
  const prevCredentialsRef = useRef({ token: null, userId: null });

  // Redux에서 userId를 가져오고, tokenStorage에서 토큰을 가져옵니다.
  // shallowEqual을 사용하여 값이 같으면 재렌더링을 피합니다.
  const userId = useSelector((state) => state.user.myInfo?.userId, shallowEqual);
  const token = tokenStorage.getAccessToken();

  // 알림 추가 함수
  const addNotification = (type, data) => {
    setNotifications((prev) => [...prev, { type, data }]);
  };

  // SSE 연결 생성 함수
  const connect = () => {
    if (!userId || !token) return; // 필수 정보 없으면 실행하지 않음

    const url = `${baseURL}/subscribe/${userId}`;

    // 혹시 남아있는 연결이 있다면 종료.
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const es = new EventSourcePolyfill(url, {
      headers: { Access: token },
      heartbeatTimeout: 120000,
    });

    // 연결 성공 이벤트 처리
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
      console.log(parsedData);
      if (parsedData.groupId) {
        addNotification("group", parsedData);
      } else if (parsedData.senderName) {
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

    // onerror 핸들러 개선: 특정 오류는 무시합니다.
    es.onerror = (event) => {
      const errorMessage = event?.error?.message || "";
      if (
        errorMessage.includes("ERR_INCOMPLETE_CHUNKED_ENCODING") ||
        errorMessage.includes("network error")
      ) {
        return;
      }
      console.error("SSE 연결 오류:", event);
    };

    eventSourceRef.current = es;
  };

  // SSE 연결 해제 함수 (unsubscribe API 호출 포함)
  const disconnect = async () => {
    if (!userId || !token) return;

    try {
      const response = await fetch(`${baseURL}/unsubscribe/${userId}`, {
        method: "GET", // 서버 요구사항에 맞게 변경
        headers: {
          Access: token,
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
        eventSourceRef.current = null;
        console.log("SSE 연결 종료됨");
      }
    }
  };

  /* 
    [연결 관리 로직]
    - token이나 userId가 변경되었을 때만 기존 연결을 해제하고 새로 연결합니다.
    - 만약 이전 인증 정보와 동일하면 새 연결을 생성하지 않습니다.
  */
  useEffect(() => {
    if (!token || !userId) return;

    // 인증 정보가 바뀌었으면 기존 연결 해제
    if (
      eventSourceRef.current &&
      (prevCredentialsRef.current.token !== token ||
        prevCredentialsRef.current.userId !== userId)
    ) {
      disconnect();
    }

    // 현재 인증 정보를 저장
    prevCredentialsRef.current = { token, userId };

    // 활성 연결이 없을 때만 연결 생성
    if (!eventSourceRef.current) {
      connect();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, userId]);

  // 컴포넌트 언마운트 시 연결을 종료합니다.
  useEffect(() => {
    return () => {
      disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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


// import React, { createContext, useEffect, useState, useRef } from "react";
// import PropTypes from "prop-types";
// import { useSelector, shallowEqual } from "react-redux";
// // 이제 기본 EventSource를 사용하므로 별도의 polyfill을 import하지 않습니다.
// import { baseURL } from "../api/userAxios";

// // 알림 Context 생성
// export const NotificationsContext = createContext();

// export const NotificationsProvider = ({ children }) => {
//   const [notifications, setNotifications] = useState([]);
//   const eventSourceRef = useRef(null);
//   // 이전에 사용된 userId를 저장하여 불필요한 재연결을 방지합니다.
//   const prevCredentialsRef = useRef({ userId: null });

//   // Redux에서 userId를 가져옵니다.
//   const userId = useSelector((state) => state.user.myInfo?.userId, shallowEqual);

//   // 알림 추가 함수
//   const addNotification = (type, data) => {
//     setNotifications((prev) => [...prev, { type, data }]);
//   };

//   // SSE 연결 생성 함수 (native EventSource 사용)
//   const connect = () => {
//     if (!userId) return; // userId가 없으면 실행하지 않음

//     const url = `${baseURL}/subscribe/${userId}`;

//     // 기존 연결이 있다면 종료
//     if (eventSourceRef.current) {
//       eventSourceRef.current.close();
//     }

//     // 기본 EventSource 인스턴스 생성 (커스텀 헤더 불가)
//     const es = new EventSource(url);

//     // 연결 성공 이벤트 처리
//     es.addEventListener("connect", (event) => {
//       console.log("연결됨:", event.data);
//     });

//     // lost-data 이벤트 처리
//     es.addEventListener("lost-data", (event) => {
//       let parsedData;
//       try {
//         parsedData = JSON.parse(event.data);
//       } catch {
//         parsedData = event.data;
//       }
//       console.log("lost-data:", parsedData);
//       if (parsedData.groupId) {
//         addNotification("group", parsedData);
//       } else if (parsedData.senderName) {
//         addNotification("friend", parsedData);
//       } else {
//         addNotification("invite", parsedData);
//       }
//     });

//     // friendRequest 이벤트 처리
//     es.addEventListener("friendRequest", (event) => {
//       let parsedData;
//       try {
//         parsedData = JSON.parse(event.data);
//       } catch {
//         parsedData = event.data;
//       }
//       addNotification("friend", parsedData);
//     });

//     // groupRequest 이벤트 처리
//     es.addEventListener("groupRequest", (event) => {
//       let parsedData;
//       try {
//         parsedData = JSON.parse(event.data);
//       } catch {
//         parsedData = event.data;
//       }
//       console.log("groupRequest 이벤트 데이터:", parsedData);
//       addNotification("group", parsedData);
//     });

//     // invite 이벤트 처리
//     es.addEventListener("invite", (event) => {
//       let parsedData;
//       try {
//         parsedData = JSON.parse(event.data);
//       } catch {
//         parsedData = event.data;
//       }
//       console.log("invite 이벤트 데이터:", parsedData);
//       addNotification("invite", parsedData);
//     });

//     // onerror 핸들러
//     es.onerror = (event) => {
//       console.error("SSE 연결 오류:", event);
//     };

//     eventSourceRef.current = es;
//   };

//   // SSE 연결 해제 함수 (unsubscribe API 호출 포함)
//   const disconnect = async () => {
//     if (!userId) return;

//     try {
//       // unsubscribe API를 호출 (인증 헤더 없이 호출)
//       const response = await fetch(`${baseURL}/unsubscribe/${userId}`, {
//         method: "GET",
//       });
//       if (!response.ok) {
//         const errorText = await response.text();
//         console.error("unsubscribe 에러:", response.status, errorText);
//       } else {
//         const result = await response.json();
//         console.log("unsubscribe 성공:", result);
//       }
//     } catch (error) {
//       console.error("unsubscribe 에러:", error);
//     } finally {
//       if (eventSourceRef.current) {
//         eventSourceRef.current.close();
//         eventSourceRef.current = null;
//         console.log("SSE 연결 종료됨");
//       }
//     }
//   };

//   /*
//     [연결 관리 로직]
//     - userId가 변경되었을 때만 기존 연결을 해제하고 새로 연결합니다.
//     - 이전 userId와 동일하면 새 연결을 생성하지 않습니다.
//   */
//   useEffect(() => {
//     if (!userId) return;

//     if (eventSourceRef.current && prevCredentialsRef.current.userId !== userId) {
//       disconnect();
//     }

//     prevCredentialsRef.current = { userId };

//     if (!eventSourceRef.current) {
//       connect();
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [userId]);

//   // 컴포넌트 언마운트 시 연결 종료
//   useEffect(() => {
//     return () => {
//       disconnect();
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   return (
//     <NotificationsContext.Provider value={{ notifications, setNotifications }}>
//       {children}
//     </NotificationsContext.Provider>
//   );
// };

// NotificationsProvider.propTypes = {
//   children: PropTypes.node.isRequired,
// };

// export default NotificationsProvider;
