import { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import PasswordCheck from "./PasswordCheck";
import SettingPage from "./SettingPage";

const MeetingRoom = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // 비밀방 여부
  const isPrivateRoom = !!location.state?.isPrivate;
  const initialStep = isPrivateRoom ? 1 : 2;
  const [step, setStep] = useState(initialStep);

  useEffect(() => {
    if (step === 3) {
      // 모든 체크가 완료되면 my‑ide 전체 앱 로드
      window.location.href = `/ide?roomId=${id}`;
    }
  }, [step, id]);

  // 비밀번호 체크 성공
  const handlePasswordSuccess = () => {
    setStep(2);
  };

  // 세팅 완료
  const handleSettingComplete = () => {
    setStep(3);
  };

  // 모달 닫기 버튼 클릭 시
  const handleModalClose = () => {
    Swal.fire({
      title: "정말 이 창을 닫으시겠습니까?",
      text: "닫을 경우, 방 목록으로 이동합니다.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "확인",
      cancelButtonText: "취소",
      width: "500px",
      background: "#f8f9fa",
      confirmButtonColor: "#FFCC00",
      cancelButtonColor: "#ddd",
      customClass: {
        popup: "swal-custom-popup", // 전체 팝업 스타일
        title: "swal-custom-title", // 제목 스타일
        htmlContainer: "swal-custom-text", // 본문 텍스트 스타일
        confirmButton: "swal-custom-button", // 버튼 스타일
        cancelButton: "swal-custom-button2", // 버튼 스타일
      },
    }).then((result) => {
      if (result.isConfirmed) {
        window.location.replace("/meeting");
      }
    });
  };

  return (
    <div className="dark:text-darkText min-h-screen bg-base-200 p-4">
      <h1 className="text-xl font-bold mb-4">{id}번 스터디룸</h1>

      {step === 1 && (
        <div className="modal modal-open">
          <div className="modal-box relative">
            <button
              className="btn btn-sm btn-circle absolute right-2 top-2"
              onClick={handleModalClose}
            >
              ✕
            </button>
            <PasswordCheck
              roomId={id}
              title={`${id}번 스터디룸`}
              onPasswordCheck={handlePasswordSuccess}
            />
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="modal modal-open">
          <div className="modal-box relative">
            <button
              className="btn btn-sm btn-circle absolute right-2 top-2"
              onClick={handleModalClose}
            >
              ✕
            </button>
            <SettingPage
              title={`${id}번 스터디룸`}
              onSettingCheck={handleSettingComplete}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default MeetingRoom;
