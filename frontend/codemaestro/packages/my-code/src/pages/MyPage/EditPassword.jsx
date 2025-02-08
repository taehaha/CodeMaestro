import { useState } from "react";
import "./EditPassword.css"; // 스타일 적용
import Swal from "sweetalert2";
import { putPassword } from "../../api/AuthApi";
import { useNavigate } from "react-router-dom"
const EditPassword = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // 새 비밀번호와 새 비밀번호 확인이 일치하는지 확인
    if (newPassword !== confirmPassword) {
      await Swal.fire({
        icon: "warning",
        title: "비밀번호 불일치",
        text: "새 비밀번호가 일치하지 않습니다.",
      });
      return;
    }
  
    try {
      const response = await putPassword({ currentPassword, newPassword });
  
      if (response.status === 200) {
        await Swal.fire({
          icon: "success",
          title: "변경 완료",
          text: "비밀번호가 변경되었습니다!",
        });
        navigate("/"); // 성공 시 홈으로 이동
      } else if (response.status === 400) {
        await Swal.fire({
          icon: "error",
          title: "변경 실패",
          text: "비밀번호 변경에 실패하였습니다. 입력 정보를 확인해주세요.",
        });
      } else {
        await Swal.fire({
          icon: "error",
          title: "오류 발생",
          text: `알 수 없는 오류가 발생했습니다. (에러 코드: ${response.status})`,
        });
      }
    } catch (error) {
      console.error("비밀번호 변경 중 오류 발생:", error);
      await Swal.fire({
        icon: "error",
        title: "서버 오류",
        text: "비밀번호 변경 요청 중 문제가 발생했습니다. 나중에 다시 시도해주세요.",
      });
    }
  };


  return (
    <div className="edit-password-container">
      <h2 className="title">비밀번호 변경</h2>
      <p className="subti tle">새로 사용할 비밀번호를 입력해 주세요.</p>
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