import PropTypes from "prop-types";
import Swal from "sweetalert2";
import { deleteFriend } from "../../api/FriendApi";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useState } from "react";
import SolvedacModal from "../MyPage/SolvdacPage";

const ManageFriend = ({ openAddFriendPage, checkedUsers }) => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.user.myInfo);
  const [solvedacModalOpen, setSolvedacModalOpen] = useState(false);

  const handleDelete = async () => {
    if (!checkedUsers.length) {
      Swal.fire({
        title: "선택된 유저가 존재하지 않습니다.",
        icon: "warning",
      });
      return;
    }

    const result = await Swal.fire({
      title: "친구 삭제를 진행하시겠습니까?",
      text: "이 작업은 되돌릴 수 없습니다.",
      showCancelButton: true,
      confirmButtonText: "확인",
      cancelButtonText: "취소",
      cancelButtonColor: "#B0BEC5",
    });

    if (result.isConfirmed) {
      try {
        // 선택된 모든 친구에 대해 삭제 API 호출
        await Promise.all(
          checkedUsers.map((user) => deleteFriend(user.requestId))
        );

        Swal.fire({
          title: "삭제 완료",
          text: "친구 삭제가 완료되었습니다.",
          icon: "success",
        }).then((res) => {
          if (res.isConfirmed) {
            window.location.reload();
            navigate("/mypage", { state: { tab: "friends" } });
          }
        });
      } catch (error) {
        console.error("친구 삭제 실패:", error);
        Swal.fire({
          title: "삭제 실패",
          text: "친구 삭제에 실패했습니다. 다시 시도해주세요.",
          icon: "error",
        });
      }
    }
  };

  // user.solvedacTire 값에 따라 버튼 문구 결정 (값이 있으면 연동 완료, 없으면 연동 진행)
  const solvedacButtonText = user?.bojTier !== 100 
    ? "Solved.ac 연동됨"
    : "Solved.ac 연동하기";

  return (
    <div className="flex flex-col justify-center items-center h-full">
      <button
        className="btn rounded-full w-40 mb-3 bg-primary text-white"
        onClick={openAddFriendPage}
      >
        새로운 친구 추가
      </button>
      <button
        className="btn rounded-full w-40 mb-3 bg-error text-white"
        onClick={handleDelete}
      >
        친구 삭제
      </button>
      <button
        onClick={() => setSolvedacModalOpen(true)}
        className="btn rounded-full w-40 mb-3"
      >
        {solvedacButtonText}
      </button>

      {/* 모달 컴포넌트 */}
      <SolvedacModal
        open={solvedacModalOpen}
        onClose={() => setSolvedacModalOpen(false)}
      />
    </div>
  );
};

/**
 * PropTypes 정의
 * - openAddFriendPage: 함수 (필수)
 * - checkedUsers: 배열 (필수), 각 요소는 requestId를 가진 객체
 */
ManageFriend.propTypes = {
  openAddFriendPage: PropTypes.func.isRequired,
  checkedUsers: PropTypes.arrayOf(
    PropTypes.shape({
      requestId: PropTypes.number.isRequired,
    })
  ).isRequired,
};

export default ManageFriend;
