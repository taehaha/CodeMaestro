import React, { useState } from 'react';
import UserAxios from '../../api/userAxios';
import './ForgotPassword.css';
import Swal from 'sweetalert2';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      Swal.fire({
        title: "오류",
        text: "이메일을 입력해주세요.",
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
      return;
    }

    try {
      const response = await UserAxios.post('/auth/find-password', {
        email: email
      });

      if (response.status===200) {
        Swal.fire({
          title: "성공",
          text: "비밀번호 재설정 링크가 이메일로 전송되었습니다.",
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
      } else {
        Swal.fire({
          title: "실패",
          text: response.data.message || "이메일을 확인해주세요.",
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
    } catch (error) {
      if (error.response.status === 404) {
        Swal.fire({
          title: "오류",
          text: "존재하지 않는 이메일입니다",
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
      } else {
        Swal.fire({
          title: "오류",
          text: "서버와의 통신에 실패했습니다. 다시 시도해주세요.",
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

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-box">
        <h1>비밀번호 찾기</h1>
        <p>비밀번호가 생각나지 않으세요?</p>
        <p>회원정보에 등록하신 이메일 주소로 임시 비밀번호를 보내드립니다.</p>
        <p>아래 입력하신 이메일 주소는 회원정보에 등록된 이메일 주소와 반드시 같아야 합니다.</p>

        <form onSubmit={handleSubmit}>
          <div className="forgot-form-group">
            <label htmlFor="email">이메일</label>
            <input 
              type="email" 
              id="email" 
              placeholder="이메일 입력" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <button type="submit" className="forgot-submit-btn">확인</button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
