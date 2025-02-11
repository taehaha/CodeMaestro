import PropTypes from 'prop-types';
import Swal from 'sweetalert2';
import { FriendRequest } from '../api/FriendApi';
import { assign } from 'lodash';
import { useSelector } from "react-redux";

const UserDetail = ({ user, checkedUsers, setCheckedUsers, addPage }) => {
  // 체크박스 선택/해제 처리
  const myInfo = useSelector((state) => state.user.myInfo);

  const handleCheckboxChange = (isChecked) => {
    if (isChecked) {
      // 체크 시 해당 유저를 배열에 추가
      setCheckedUsers([...checkedUsers, user]);
    } else {
      // 체크 해제 시 해당 유저 제거 (user.userId 기준)
      setCheckedUsers(checkedUsers.filter((f) => f.userId !== user.userId));
    }
  };

  // 친구 추가 요청 처리 (addPage 모드)
  const handleAdd =  () => {
    Swal.fire({
      title: '친구 추가',
      text: `${user.nickname}님에게 친구 추가를 요청하시겠습니까?`,
      showCancelButton: true,
      confirmButtonText: "확인",
      cancelButtonText: "취소",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
            await FriendRequest({senderId:myInfo.userId, receiverId:user.userId})
        } catch (error) {
            console.error("친구추가 요청 실패", error);
            Swal.fire({title:"에러 발생",
                icon:"error",
                text:"친구 추가 요청 중 에러가 발생하였습니다."
            })
            
        }
        // 실제 axios 요청 로직 추가
      }
    });
  };

  return (
    <li
      className={`flex py-4 first:pt-0 last:pb-0 ${addPage ? 'hover:brightness-75' : ''}`}
      onClick={addPage ? handleAdd : undefined}
    >
      <img
        className="h-10 w-10 rounded-full"
        src={user.profileImageUrl}
        alt="profile"
      />
      <div className="ml-3 overflow-hidden">
        <div>
          <span className="text-sm font-medium text-slate-900">
            {user.nickname}
          </span>
        </div>
        <p className="text-sm text-slate-500 truncate">
          {user.description}
        </p>
      </div>
      {/* addPage 모드가 아니면 체크박스 노출 */}
      {!addPage && (
        <div className="ml-auto my-auto">
          <input
            type="checkbox"
            className="checkbox dark:checkbox-warning rounded-sm"
            onChange={(e) => handleCheckboxChange(e.target.checked)}
          />
        </div>
      )}
    </li>
  );
};

UserDetail.propTypes = {
  invite: PropTypes.bool,
  user: PropTypes.shape({
    nickname: PropTypes.string.isRequired,
    profileImageUrl: PropTypes.string,
    description: PropTypes.string,
    loginId: PropTypes.string.isRequired,
    userId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  }).isRequired,
  checkedUsers: PropTypes.array,
  setCheckedUsers: PropTypes.func,
  addPage: PropTypes.bool,
};

export default UserDetail;
