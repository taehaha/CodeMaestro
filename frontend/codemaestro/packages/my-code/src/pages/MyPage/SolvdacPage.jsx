import { use, useState } from "react";
import Swal from "sweetalert2";
import UserAxios from "../../api/userAxios"; // 백엔드 solved.ac 연동 API 호출용 Axios 인스턴스
import { putUserInfo } from "../../api/AuthApi";
import { useDispatch } from "react-redux";
import { getMyInfo } from "../../reducer/userSlice";
const SolvedacModal = ({ open, onClose }) => {
  const dispatch = useDispatch()
  const [solvedacId, setSolvedacId] = useState("");

  const handleUpdate = async () => {
    if (!solvedacId.trim()) {
      Swal.fire({
        title: "입력 오류",
        text: "Solved.ac 아이디를 입력해주세요.",
        icon: "warning",
      });
      return;
    }

    try {
      // 백엔드에 solved.ac id를 전송하고, 숫자(티어 값)를 반환받음
      const response = await UserAxios.get(`/boj/tier?bojId=${solvedacId}`);
      // 예시: response.data가 숫자형 티어 값이라고 가정 (필요에 따라 구조를 확인)
      const solvedacTier = response.data;

      // 기존 유저 수정 로직에 맞게 solvedacTier 값을 업데이트 (예: Redux dispatch 또는 API 호출)
      // 아래 putUserInfo 함수는 예시이며, 실제 프로젝트의 업데이트 로직에 맞게 수정하세요.
      await putUserInfo({ solvedacTier });

      Swal.fire({
        title: "연동 성공",
        icon: "success",
        text: "Solved.ac 정보 연동이 완료되었습니다!",
      }).then(async (result) => {
        if (result.isConfirmed) {
          onClose();
          await dispatch(getMyInfo());
          window.location.reload();
        }
      });
    } catch (error) {
      console.error("연동 실패:", error);
      Swal.fire({
        title: "아이디 검색 실패",
        text: "연동 중 오류가 발생했습니다. 입력 정보를 다시 확인해주세요.",
        icon: "error",
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
        <div className="modal-box relative">
          {/* 모달 닫기 버튼 */}
          <button
            onClick={onClose}
            className="btn btn-sm btn-circle absolute right-2 top-2"
          >
            ✕
          </button>

          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">Solved.ac 연동</h3>
            <p className="mb-4">Solved.ac 아이디를 입력해주세요.</p>
            <input
              type="text"
              value={solvedacId}
              onChange={(e) => setSolvedacId(e.target.value)}
              placeholder="Solved.ac 아이디"
              className="input input-bordered w-full mb-4"
            />
            <button onClick={handleUpdate} className="btn btn-primary">
              연동
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default SolvedacModal;
