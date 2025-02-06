import { useState } from "react";
import "./EditPassword.css"; // 스타일 적용

const EditPassword = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const mockPassword = "123456";  // 서버 API 연동 시 제거하고 DB에서 가져오도록 변경경

  const handleSubmit = (e) => {
    e.preventDefault();

    // 현재 비밀번호가 맞는지 확인
    if (currentPassword !== mockPassword) {
      alert("현재 비밀번호가 올바르지 않습니다.");
      return;
    }

    // 새 비밀번호와 새 비밀번호 확인이 일치하는지 확인
    if (newPassword !== confirmPassword) {
      alert("새 비밀번호가 일치하지 않습니다.");
      return;
    }
    alert("비밀번호가 변경되었습니다!");
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