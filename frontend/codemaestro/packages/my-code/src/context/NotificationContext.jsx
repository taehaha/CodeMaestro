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

<<<<<<< HEAD
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
=======
    const url = `${baseURL}/subscribe/${userId}`;

    // 혹시 남아있는 연결이 있다면 종료합니다.
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
>>>>>>> develop/frontend

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
