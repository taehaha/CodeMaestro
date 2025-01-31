import { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import Swal from "sweetalert2";
import PasswordCheck from './PasswordCheck';
import SettingPage from './SettingPage';

const MeetingRoom = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // 넘어온 값이 true면 비밀방
  const isPrivateRoom = !!location.state?.isPrivate;

  // step:
  // 1 -> 비밀번호 체크 단계 (비밀방인 경우)
  // 2 -> 세팅 단계
  // 3 -> 실제 회의실
  const initialStep = isPrivateRoom ? 1 : 2;
  const [step, setStep] = useState(initialStep);

  useEffect(() => {
    if (step === 3) {
      // OpenVidu 세션 연결 로직, 또는 최종 입장 처리
      console.log("모든 체크가 완료되어 회의실 화면을 표시합니다.");
    }
  }, [step]);

  // 비밀번호 체크 성공
  const handlePasswordSuccess = () => {
    setStep(2);
  };

  // 세팅 완료
  const handleSettingComplete = () => {
    setStep(3);
  };

  // 모달 닫기 버튼 누를 때
  const handleModalClose = () => {
    Swal.fire({
      title: "정말 이 창을 닫으시겠습니까?",
      text: "닫을 경우, 방 목록으로 이동합니다.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "확인",
      cancelButtonText: "취소",
    }).then((result) => {
      if (result.isConfirmed) {
        // 모달 닫기 → 회의 목록 페이지로 이동
        navigate("/meeting");
      }
    });
  };

  return (
    <div className="dark:text-darkText min-h-screen bg-base-200 p-4">
      <h1 className="text-xl font-bold mb-4">{id}번 회의실</h1>

      {/* step=1 : 비밀번호 모달 */}
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
              title={`${id}번 회의실`}
              onPasswordCheck={handlePasswordSuccess}
            />
          </div>
        </div>
      )}

      {/* step=2 : 세팅 모달 */}
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
              title={`${id}번 회의실`}
              onSettingCheck={handleSettingComplete}
            />
          </div>
        </div>
      )}

      {/* step=3 : 실제 회의실 */}
      {step === 3 && (
        <div className="p-4">
          <h2 className="text-lg font-semibold mb-2">회의실 화면</h2>
          <p className="text-sm">회의가 시작되었습니다!</p>
          {/* 여기서 OpenVidu 관련 컴포넌트를 렌더링할 수 있습니다. */}
        </div>
      )}
    </div>
  );
};

export default MeetingRoom;
