import { useState } from "react";
import Swal from "sweetalert2";
import UserAxios from "../../api/userAxios"; // 백엔드 solved.ac 연동 API 호출용 Axios 인스턴스
import { putUserInfo } from "../../api/AuthApi";
import { useDispatch } from "react-redux";
import { getMyInfo } from "../../reducer/userSlice";
import { baseURL } from "../../api/userAxios";
const SolvedacModal = ({ open, onClose }) => {
  const dispatch = useDispatch()
  const [solvedacId, setSolvedacId] = useState("");

  const handleUpdate = async () => {
    if (!solvedacId.trim()) {
      Swal.fire({
        title: "입력 오류",
        text: "Solved.ac 아이디를 입력해주세요.",
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

    try {
      // 백엔드에 solved.ac id를 전송하고, 숫자(티어 값)를 반환받음
      const response = await UserAxios.get(`${baseURL}/boj/tier?bojId=${solvedacId}`);
      // 예시: response.data가 숫자형 티어 값이라고 가정 (필요에 따라 구조를 확인)
      const solvedacTier = response.data;

      // 기존 유저 수정 로직에 맞게 solvedacTier 값을 업데이트 (예: Redux dispatch 또는 API 호출)
      // 아래 putUserInfo 함수는 예시이며, 실제 프로젝트의 업데이트 로직에 맞게 수정하세요.
      await putUserInfo({ solvedacTier });

      Swal.fire({
        title: "연동 성공",
        icon: "success",
        text: "Solved.ac 정보 연동이 완료되었습니다!",
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
      }).then((result) => {
        if (result.isConfirmed) {
          onClose();
          dispatch(getMyInfo());
          window.location.reload();
        }
      });
    } catch (error) {
      console.error("연동 실패:", error);
      Swal.fire({
        title: "아이디 검색 실패",
        text: "연동 중 오류가 발생했습니다. 입력 정보를 다시 확인해주세요.",
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
  };

  return (
    <>
      {/* DaisyUI 모달 토글 (open prop으로 제어) */}
      <input
        type="checkbox"
        id="solvedac-modal"
        className="modal-toggle"
        checked={open}
        readOnly
      />
      <div className="modal">
        <div className="modal-box relative w-full max-w-lg rounded-xl">
          {/* 모달 닫기 버튼 */}
          {/* <button
            onClick={onClose}
            className="btn btn-sm btn-circle absolute right-2 top-2"
          >
            ✕
          </button> */}

          <div className="text-center">
            <h3 className="text-xl mb-3">Solved.ac 연동</h3>
            <p className="mb-5 p-4">Solved.ac 아이디를 입력해주세요.</p>

            <input
              type="text"
              value={solvedacId}
              onChange={(e) => setSolvedacId(e.target.value)}
              placeholder="Solved.ac 아이디"
              className="input input-bordered w-full mb-4"
            />
            <div className="flex justify-center gap-2 mt-4">
            <button onClick={handleUpdate} className="bg-yellow-400 text-black px-4 py-2 rounded-md hover:bg-yellow-500">
              연동
            </button>
            <button onClick={onClose} className="bg-[#ddd] text-black px-4 py-2 rounded-md hover:bg-[#ccc]">
              닫기
            </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SolvedacModal;
