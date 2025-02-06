/* eslint-disable react/prop-types */
import { useContext } from "react";
import { NotificationsContext } from "../../context/NotificationContext";
import { FaUserFriends, FaEnvelope, FaUsers, FaQuestion } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { AcceptGroupRequest, RejectGroupRequest } from "../../api/GroupApi";
// 실제 axios 요청은 아래와 같이 처리할 예정
// import UserAxios from "../../api/userAxios";

const NotificationModal = ({ onClose }) => {
  // Context에서 notifications와 setNotifications를 받아옴
  const { notifications, setNotifications } = useContext(NotificationsContext);
  const navigate = useNavigate();

  const handleAccept = (notification) => {
    if (notification.type === "invite") {
      Swal.fire({
        title: "요청 수락",
        text: "초대받은 회의실로 이동합니다",
      }).then(() => {
        console.log("invite 수락 처리 후 이동");
        navigate(`/meeting/${notification.roomId}`);
      });

    } else if (notification.type === "friend") {
      // TODO: 친구 요청 수락 axios 요청 (예: UserAxios.post('/accept-friend', { request: notification.request }))
      console.log(`${notification.request}번 친구 요청 수락 axios 요청 보내기`);
      setNotifications((prev) =>
        prev.filter((n) => n.request !== notification.request)
      );
    } else if (notification.type === "group") {
      // TODO: 그룹 요청 수락 axios 요청 (예: UserAxios.post('/accept-group', { request: notification.request }))
      console.log(`${notification.request}번 그룹 요청 수락 axios 요청 보내기`);
      setNotifications((prev) =>
        prev.filter((n) => n.request !== notification.request)
      );
    }
  };

  const handleReject = (notification) => {
    if (notification.type === "invite") {
      console.log(`${notification.request}번 invite 요청 거절 처리 (알림 제거)`);
      setNotifications((prev) =>
        prev.filter((n) => n.request !== notification.request)
      );
    } else if (notification.type === "friend") {
      // TODO: 친구 요청 거절 axios 요청 (예: UserAxios.post('/reject-friend', { request: notification.request }))
      console.log(`${notification.request}번 친구 요청 거절 axios 요청 보내기`);
      setNotifications((prev) =>
        prev.filter((n) => n.request !== notification.request)
      );
    } else if (notification.type === "group") {
      // TODO: 그룹 요청 거절 axios 요청 (예: UserAxios.post('/reject-group', { request: notification.request }))
      console.log(`${notification.request}번 그룹 요청 거절 axios 요청 보내기`);
      setNotifications((prev) =>
        prev.filter((n) => n.request !== notification.request)
      );
    }
  };

  return (
    <div className="notification-modal p-4 bg-white rounded-lg shadow-lg max-w-md mx-auto">
      {/* 모달 헤더 */}
      <div className="flex justify-between items-center border-b pb-3 mb-3">
        <h3 className="text-lg font-bold">알림</h3>
        <button
          className="text-gray-500"
          onClick={onClose}
        >
          ✖
        </button>
      </div>

      {/* 알림 리스트 */}
      <ul className="space-y-3">
        {notifications?.length > 0 ? (
          notifications.map((notification, index) => (
            <li
              key={index}
              className="flex items-center p-2 rounded-sm border border-gray-200 bg-gray-50"
            >
              <div className="mr-2 text-xl">
                {notification.type === "friend" ? (
                  <FaUserFriends className="text-green-500" />
                ) : notification.type === "invite" ? (
                  <FaEnvelope className="text-blue-500" />
                ) : notification.type === "group" ? (
                  <FaUsers className="text-purple-500" />
                ) : (
                  <FaQuestion className="text-gray-500" />
                )}
              </div>
              <div className="flex-grow">
                {notification.type === "friend" && (
                  <>
                    <p className="font-semibold">{notification.userName}</p>
                    <p className="text-xs text-gray-600">{notification.message}</p>
                  </>
                )}
                {notification.type === "group" && (
                  <>
                    <p className="font-semibold">{notification.groupName}</p>
                    <p className="text-xs text-gray-600">{notification.message}</p>
                  </>
                )}
                {notification.type === "invite" && (
                  <p className="font-semibold">{notification.name}</p>
                )}
              </div>
              <div className="flex space-x-2">
                <button
                  className="px-3 py-1 bg-blue-500 text-white rounded-sm hover:bg-blue-600 transition-colors duration-200"
                  onClick={() => handleAccept(notification)}
                >
                  수락
                </button>
                <button
                  className="px-3 py-1 bg-red-500 text-white rounded-sm hover:bg-red-600 transition-colors duration-200"
                  onClick={() => handleReject(notification)}
                >
                  거절
                </button>
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
