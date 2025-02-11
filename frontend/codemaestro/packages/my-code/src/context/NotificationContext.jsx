import { createContext, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { useSelector, shallowEqual, useDispatch } from "react-redux";
import { EventSourcePolyfill } from "event-source-polyfill";
import tokenStorage from "../utils/tokenstorage";
import { baseURL } from "../api/userAxios";
import { toast } from "react-toastify";
import { fetchNotifications } from "../reducer/notificationSlice";

// 알림 Context 생성 (Redux로 모든 알림 상태를 관리하므로 value는 비워두거나 추후 확장할 수 있습니다.)
export const NotificationsContext = createContext();

export const NotificationsProvider = ({ children }) => {
  const dispatch = useDispatch();
  const eventSourceRef = useRef(null);
  // 이전 인증 정보를 저장해 불필요한 재연결을 방지합니다.
  const prevCredentialsRef = useRef({ token: null, userId: null });

  // Redux 또는 tokenStorage에서 인증 정보를 가져옵니다.
  const userId = useSelector((state) => state.user.myInfo?.userId, shallowEqual);
  const token = tokenStorage.getAccessToken();

  // toast 알림 표시 함수
  const displayToast = (type, message) => {
    toast(message, {
      type, // 예: "info", "success", "warning", "error"
      position: "bottom-right",
      autoClose: 5000,
    });
  };

  // SSE 연결 생성 함수
  const connect = () => {
    if (!userId || !token) return; // 필수 정보 없으면 실행하지 않음

    const url = `${baseURL}/subscribe/${userId}`;

    // 기존 연결이 있다면 종료합니다.
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

      let message = "";
      if (parsedData.groupId) {
        message = parsedData.message || "새로운 그룹 가입 요청이 도착했습니다.";
      } else if (parsedData.senderName) {
        message = `친구 요청: ${parsedData.senderName}님으로부터 친구 요청이 있습니다.`;
      } else {
        message = parsedData.message || "새로운 초대 알림이 도착했습니다.";
      }

      // API를 호출해 전체 알림 목록을 Redux 저장소에 업데이트합니다.
      dispatch(fetchNotifications(userId));
      
      // 토스트 알림 표시
      toast.info(message, {
        position: toast.POSITION.BOTTOM_RIGHT,
        autoClose: 5000,
      });
    });

    // friendRequest 이벤트 처리
    es.addEventListener("friendRequest", (event) => {
      let parsedData;
      try {
        parsedData = JSON.parse(event.data);
      } catch {
        parsedData = event.data;
      }
      displayToast(
        "info",
        `친구 요청: ${parsedData.senderName || "새로운 친구 요청이 있습니다."}`
      );
      dispatch(fetchNotifications(userId));
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
      displayToast(
        "info",
        `그룹 요청: ${parsedData.groupName || "새로운 그룹 요청이 있습니다."}`
      );
      dispatch(fetchNotifications(userId));
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
      displayToast(
        "info",
        `초대 알림: ${parsedData.message || "새로운 초대 알림이 도착했습니다."}`
      );
      dispatch(fetchNotifications(userId));
    });

    // onerror 핸들러: 특정 오류는 무시합니다.
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
        headers: { Access: token },
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
    - token이나 userId가 변경되었을 때 기존 연결을 해제하고 새로 연결합니다.
    - 이전 인증 정보와 동일하면 새 연결을 생성하지 않습니다.
  */
  useEffect(() => {
    if (!token || !userId) return;

    if (
      eventSourceRef.current &&
      (prevCredentialsRef.current.token !== token ||
        prevCredentialsRef.current.userId !== userId)
    ) {
      disconnect();
    }

    prevCredentialsRef.current = { token, userId };

    if (!eventSourceRef.current) {
      connect();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, userId]);

  // 컴포넌트 언마운트 시 연결 종료
  useEffect(() => {
    return () => {
      disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <NotificationsContext.Provider value={{}}>
      {children}
    </NotificationsContext.Provider>
  );
};

NotificationsProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default NotificationsProvider;
