import PropTypes from "prop-types";
import Swal from "sweetalert2";
import { deleteFriend } from "../../api/FriendApi";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useState } from "react";
import SolvedacModal from "../MyPage/SolvdacPage";
import "./ManageFriend.css"

const ManageFriend = ({ openAddFriendPage, checkedUsers }) => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.user.myInfo);
  const [solvedacModalOpen, setSolvedacModalOpen] = useState(false);

  const handleDelete = async () => {
    if (!checkedUsers.length) {
      Swal.fire({
        title: "선택된 유저가 존재하지 않습니다.",
        icon: "warning",
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
      });
      return;
    }

    const result = await Swal.fire({
      title: "친구 삭제를 진행하시겠습니까?",
      text: "이 작업은 되돌릴 수 없습니다.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "확인",
      cancelButtonText: "취소",
      width: "500px",
      background: "#f8f9fa",
      confirmButtonColor: "#FFCC00",
      cancelButtonColor: "#ddd",
      customClass: {
        popup: "swal-custom-popup",       // 전체 팝업 스타일
        title: "swal-custom-title",       // 제목 스타일
        htmlContainer: "swal-custom-text", // 본문 텍스트 스타일
        confirmButton: "swal-custom-button", // 버튼 스타일
        cancelButton: "swal-custom-button2"
       } // 버튼 스타일
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
          iconColor:"#5FD87D",
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
        });
      }
    }
  };

  // user.solvedacTire 값에 따라 버튼 문구 결정 (값이 있으면 연동 완료, 없으면 연동 진행)
  const solvedacButtonText = user?.bojTier !== 100 
    ? "Solved.ac 연동됨"
    : "Solved.ac 연동";

  return (
    <div className="flex flex-col justify-center items-center h-full">
      <button
        className="add-btn"
        onClick={openAddFriendPage}
      >
        새로운 친구 추가
      </button>
      <button
        className="del-btn"
        onClick={handleDelete}
      >
        친구 삭제
      </button>
      <button
        onClick={() => setSolvedacModalOpen(true)}
        className="connect-btn"
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
