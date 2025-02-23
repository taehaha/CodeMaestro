import { useState } from "react";
import "./EditPassword.css"; // 스타일 적용
import Swal from "sweetalert2";
import { putPassword } from "../../api/AuthApi";
import { useNavigate } from "react-router-dom"
import { useSelector } from "react-redux";
import { AiOutlineExclamationCircle } from 'react-icons/ai';

const EditPassword = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate()
  const user = useSelector((state) => state.user.myInfo);

  if (user.loginProvider !== "LOCAL") {
    return(
      <div className="flex items-center justify-center w-full">
        <div className="p-6 max-w-sm w-full ">
          <div className="flex items-center justify-center mb-4">
            <AiOutlineExclamationCircle className="text-red-500 text-4xl mr-3" />
            <h2 className="text-md font-semibold text-gray-800">소셜 로그인 유저는 이용할 수 없습니다.</h2>
          </div>
        </div>
      </div>
    )
  }
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // 새 비밀번호와 새 비밀번호 확인이 일치하는지 확인
    if (newPassword !== confirmPassword) {
      await Swal.fire({
        icon: "warning",
        title: "비밀번호 불일치",
        text: "새 비밀번호가 일치하지 않습니다.",
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
      const response = await putPassword({ currentPassword, newPassword });
  
      if (response.status === 200) {
        await Swal.fire({
          title: "변경 완료",
          text: "비밀번호가 변경되었습니다!",
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
        });
        navigate("/"); // 성공 시 홈으로 이동
      } else if (response.status === 400) {
        await Swal.fire({
          icon: "error",
          title: "변경 실패",
          text: "비밀번호 변경에 실패하였습니다. 입력 정보를 확인해주세요.",
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
      } else {
        await Swal.fire({
          icon: "error",
          title: "오류 발생",
          text: `알 수 없는 오류가 발생했습니다. (에러 코드: ${response.status})`,
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
    } catch (error) {
      console.error("비밀번호 변경 중 오류 발생:", error);
      await Swal.fire({
        icon: "error",
        title: "서버 오류",
        text: "비밀번호 변경 요청 중 문제가 발생했습니다. 나중에 다시 시도해주세요.",
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
    <div className="edit-password-container">
      <h2 className="title">비밀번호 변경</h2>
      <p className="subtitle">새로 사용할 비밀번호를 입력해 주세요.</p>
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label className="input-label">현재 비밀번호</label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
        </div>

        <div className="input-group">
          <label className="input-label">새 비밀번호</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </div>

        <div className="input-group">
          <label className="input-label">새 비밀번호 확인</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="edit-password-submit-btn">확인</button>
      </form>
    </div>
  );
};

export default EditPassword;