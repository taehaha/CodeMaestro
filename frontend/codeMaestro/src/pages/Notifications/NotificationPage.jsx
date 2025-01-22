/* eslint-disable react/prop-types */
import { useContext } from "react";
import { NotificationsContext } from "../../context/NotificationContext";
import { FaUserFriends, FaEnvelope, FaUsers, FaQuestion } from "react-icons/fa"; // 아이콘 사용
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const NotificationModal = ({ onClose }) => {
  const { notifications } = useContext(NotificationsContext);
  const navigate = useNavigate()
  const handleAccept = (notification)=>{
    if (notification.type === 'invite') {
        Swal.fire({
            title:"요청 수락",
            text:`초대받은 회의실로 이동합니다`,
        }).then(()=>{
            onClose()
            navigate(`/meeting/${notification.roomId}`)})
    }
    else {
        console.log(`${notification.request}번 요청에 수락 axios 보낸다.`);
    }
  } 

  const handleReject = (notification)=>{
    if (notification.type === 'invite') {
        console.log("axios에 거절 요청 보내고 다시 get알림 처리한다.");
    }
    else {
        console.log(`${notification.request}번 요청에 거절 axios 보낸다.`);
    }
  } 

  return (
    <div className="notification-modal hover:none">
        {/* 모달 헤더 */}
        <div className="flex justify-between items-center border-b pb-3 mb-3">
          <h3 className="text-lg font-bold">알림</h3>
          <button
            className="btn btn-sm btn-circle btn-ghost"
            onClick={onClose}
          >
            ✖
          </button>
        </div>

        {/* 알림 리스트 */}
        <ul className="space-y-3">
          {notifications.length > 0 ? (
            notifications.map((notification, index) => (
              <li
                key={index}
                className="flex items-center p-3 rounded-lg shadow-md bg-base-100"
              >
                {/* 알림 내용 */}
                <div >
                <div className="mr-3 text-xl">
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
                  <p className="text-sm">
                    {notification.name}
                  </p>
                  <p className="text-xs">
                    {notification.type === "friend"
                      ? ("님의 친구 요청입니다")
                      : notification.type === "invite" ? 
                      ("님의 회의 초대입니다") : 
                      ("님의 그룹 초대입니다")}
                  </p>
                  <div className="flex ml-auto">
                    <button className="btn text-white bg-primary"
                    onClick={()=>{handleAccept(notification)}}>수락</button>
                    <button className="btn text-white bg-error"
                    onClick={()=>{handleReject(notification)}}>거절</button>
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
