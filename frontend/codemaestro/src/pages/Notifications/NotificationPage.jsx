/* eslint-disable react/prop-types */
import { useContext } from "react";
import { NotificationsContext } from "../../context/NotificationContext";
import { FaUserFriends, FaEnvelope, FaUsers, FaQuestion } from "react-icons/fa"; // 아이콘 사용
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
// 실제 axios 요청은 아래와 같이 처리할 예정
// import UserAxios from "../../api/userAxios";

const NotificationModal = ({ onClose }) => {
  // setNotifications도 Context에서 받아서 알림 배열을 직접 수정할 수 있도록 함
  const { notifications, setNotifications } = useContext(NotificationsContext);
  const navigate = useNavigate();

  const handleAccept = (notification) => {
    if (notification.type === "invite") {
      // invite의 경우 별도 axios 없이 바로 이동
      Swal.fire({
        title: "요청 수락",
        text: "초대받은 회의실로 이동합니다",
      }).then(() => {
        onClose();
        // TODO: invite 요청 수락 axios 요청이 필요한 경우 아래 주석 처리된 코드를 참고하여 추가
        // UserAxios.post('/accept-invite', { request: notification.request })
        //   .then(response => { ... })
        //   .catch(error => { ... });
        console.log("invite 수락 처리 후 이동");
        navigate(`/meeting/${notification.roomId}`);
      });
    } else if (notification.type === "friend") {
      // TODO: 친구 요청 수락 axios 요청 (예: UserAxios.post('/accept-friend', { request: notification.request }))
      console.log(`${notification.request}번 친구 요청에 수락 axios 요청 보내기`);
      // axios 요청 성공 시 알림 제거
      setNotifications((prev) =>
        prev.filter((n) => n.request !== notification.request)
      );
      onClose();
    } else if (notification.type === "group") {
      // TODO: 그룹 요청 수락 axios 요청 (예: UserAxios.post('/accept-group', { request: notification.request }))
      console.log(`${notification.request}번 그룹 요청에 수락 axios 요청 보내기`);
      // axios 요청 성공 시 알림 제거
      setNotifications((prev) =>
        prev.filter((n) => n.request !== notification.request)
      );
      onClose();
    }
  };

  const handleReject = (notification) => {
    if (notification.type === "invite") {
      // invite의 경우, 별도의 axios 없이 단순 제거
      console.log(`${notification.request}번 invite 요청에 거절 처리 (알림 제거)`);
      setNotifications((prev) =>
        prev.filter((n) => n.request !== notification.request)
      );
      onClose();
    } else if (notification.type === "friend") {
      // 친구 요청 거절 axios 요청
      // TODO: 실제 axios 요청 주소에 맞게 아래 주석 처리된 코드를 수정하여 사용
      // UserAxios.post('/reject-friend', { request: notification.request })
      //   .then(response => {
      //     console.log(`${notification.request}번 친구 요청 거절 성공`, response);
      //     setNotifications((prev) =>
      //       prev.filter((n) => n.request !== notification.request)
      //     );
      //     onClose();
      //   })
      //   .catch(error => console.error(`${notification.request}번 친구 요청 거절 오류`, error));
      console.log(`${notification.request}번 친구 요청에 거절 axios 요청 보내기`);
      // 예시로 axios 요청 성공 시 알림 제거 처리:
      setNotifications((prev) =>
        prev.filter((n) => n.request !== notification.request)
      );
      onClose();
    } else if (notification.type === "group") {
      // 그룹 요청 거절 axios 요청
      // TODO: 실제 axios 요청 주소에 맞게 아래 주석 처리된 코드를 수정하여 사용
      // UserAxios.post('/reject-group', { request: notification.request })
      //   .then(response => {
      //     console.log(`${notification.request}번 그룹 요청 거절 성공`, response);
      //     setNotifications((prev) =>
      //       prev.filter((n) => n.request !== notification.request)
      //     );
      //     onClose();
      //   })
      //   .catch(error => console.error(`${notification.request}번 그룹 요청 거절 오류`, error));
      console.log(`${notification.request}번 그룹 요청에 거절 axios 요청 보내기`);
      // 예시로 axios 요청 성공 시 알림 제거 처리:
      setNotifications((prev) =>
        prev.filter((n) => n.request !== notification.request)
      );
      onClose();
    }
  };

  return (
    <div className="notification-modal hover:none">
      {/* 모달 헤더 */}
      <div className="flex justify-between items-center border-b pb-3 mb-3">
        <h3 className="text-lg font-bold">알림</h3>
        <button className="btn btn-sm btn-circle btn-ghost" onClick={onClose}>
          ✖
        </button>
      </div>

      {/* 알림 리스트 */}
      <ul className="space-y-3">
        {notifications?.length > 0 ? (
          notifications.map((notification, index) => (
            <li
              key={index}
              className="flex items-center p-3 rounded-lg shadow-md bg-base-100"
            >
              {/* 알림 내용 */}
              <div className="flex items-center w-full">
                <div className="mr-3 text-xl">
                  {notification.type === "friend" ? (
                    <FaUserFriends className="text-green-500" />
                  ) : notification.type === "invite" ? (
                    <FaEnvelope className="text-blue-500" />
                  ) : notification.type === "group" ? (
                    <FaUsers className="" />
                  ) : (
                    <FaQuestion className="text-gray-500" />
                  )}
                </div>
                <div className="flex-grow">
                  <p className="text-sm">{notification.name}</p>
                  <p className="text-xs">
                    {notification.type === "friend"
                      ? "님의 친구 요청입니다"
                      : notification.type === "invite"
                      ? "님의 회의 초대입니다"
                      : "님의 그룹 초대입니다"}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    className="btn text-white bg-primary"
                    onClick={() => handleAccept(notification)}
                  >
                    수락
                  </button>
                  <button
                    className="btn text-white bg-error"
                    onClick={() => handleReject(notification)}
                  >
                    거절
                  </button>
                </div>
              </div>
            </li>
          ))
        ) : (
          <li className="text-center text-sm text-gray-500">
            현재 수신된 알림이 없습니다.
          </li>
        )}
      </ul>
    </div>
  );
};

export default NotificationModal;
