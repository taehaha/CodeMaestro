import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { FaUserFriends, FaEnvelope, FaUsers, FaQuestion } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { AcceptFriendsRequest, RejectFriendsRequest } from "../../api/FriendApi";
import { AcceptGroupRequest, RejectGroupRequest } from "../../api/GroupApi";
import { fetchNotifications, removeNotification } from "../../reducer/notificationSlice";

const NotificationModal = ({ onClose }) => {
  const notifications = useSelector((state) => state.notifications.items);
  const userId = useSelector((state) => state.user.myInfo?.userId);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (userId) {
      dispatch(fetchNotifications(userId));
    }
  }, [userId]);

  const handleAccept = async (notification) => {
    if (notification.type === "invite") {
      Swal.fire({
        title: "요청 수락",
        text: "초대받은 회의실로 이동합니다",
        width: "500px",
        background: "#f8f9fa",
        confirmButtonColor: "#FFCC00",
        confirmButtonText: "확인",
        customClass: {
          popup: "swal-custom-popup",       // 전체 팝업 스타일
          title: "swal-custom-title",       // 제목 스타일
          htmlContainer: "swal-custom-text", // 본문 텍스트 스타일
          confirmButton: "swal-custom-button" // 버튼 스타일
        }
      }).then(() => {
        navigate(`/meeting/${notification.roomId}`);
      });
    } else if (notification.type === "friend") {
      await AcceptFriendsRequest(notification.requestId);
    } else if (notification.type === "group") {
      await AcceptGroupRequest(notification.requestId);
    }
    // 수락 후 Redux에서 해당 알림 제거 (여기서 notification.id 사용)
    dispatch(removeNotification(notification.requestId));
  };

  const handleReject = async (notification) => {
    if (notification.type === "invite") {
      console.log("초대 거절");
    } else if (notification.type === "friend") {
      await RejectFriendsRequest(notification.requestId);
    } else if (notification.type === "group") {
      await RejectGroupRequest(notification.requestId);
    }

    dispatch(removeNotification(notification.requestId));
  };

  return (
    <div className="notification-modal p-4 bg-white rounded-lg shadow-lg max-w-md mx-auto">
      <div className="flex justify-between items-center border-b pb-3 mb-3">
        <h3 className="text-lg font-bold">알림</h3>
        <button className="text-gray-500" onClick={onClose}>✖</button>
      </div>
      <ul className="space-y-3">
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <li
              key={notification.requestId}
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
                  <p className="font-semibold">
                    {notification.nickname}님의 친구 추가 요청입니다.
                  </p>
                )}
                {notification.type === "group" && (
                  <div className="text-center">
                    <p className="font-semibold">
                      {notification.userNickname}님의 {notification.groupName}그룹 가입 요청입니다.
                    </p>
                    <p className="text-xs text-gray-600">{notification.message}</p>
                  </div>
                )}
                {notification.type === "invite" && (
                  <p className="font-semibold">{notification.name}</p>
                )}
              </div>
              <div className="flex space-x-2">
                <button
                  className="px-3 py-1 bg-[#FFCC00] text-white rounded-sm hover:bg-[#ffbb00] transition-colors duration-200"
                  onClick={() => handleAccept(notification)}
                >
                  수락
                </button>
                <button
                  className="px-3 py-1 bg-[#DB4D4D] text-white rounded-sm hover:bg-red-600 transition-colors duration-200"
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
