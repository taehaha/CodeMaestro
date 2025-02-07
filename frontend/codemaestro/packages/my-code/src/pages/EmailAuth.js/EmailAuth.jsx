import React, { useState } from "react";
import { Link } from 'react-router-dom';
import axios from "axios";
import UserAxios from "../../api/userAxios";
import { signup, emailCheck, nicknameCheck } from "../../api/AuthApi";
import "./EmailAuth.css";

const EmailAuth = () => {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [step, setStep] = useState(1);

  const [nickname, setnickname] = useState("")
  const [password, setpassword] = useState("")
  const [description, setdescription] = useState("")

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  
  //   // 필드 검증
  //   if (!email || !code) {
  //     setMessage("모든 필드를 입력하세요.");
  //     return;
  //   }
  
  //   try {
  //     const res = await emailcheck(email);
  
  //     if (res.status === 200) {
  //       setMessage("이메일 인증이 완료되었습니다.");
  //       setStep(2);
  //     }
  //   } catch (error) {
  //     // error.response.status가 400이면 중복 이메일 등 에러 처리
  //     if (error.response && error.response.status === 400) {
  //       setMessage(error.response.data.message || "중복된 이메일입니다. 다른 이메일을 사용하세요.");
  //     } else {
  //       setMessage("이메일 인증에 실패했습니다. 다시 시도해주세요.");
  //     }
  //   }
  // };
  

// 더미처리용
  const handleSubmit = (e) => {
    e.preventDefault();
    if (email && code) {
      setMessage("이메일 인증이 완료되었습니다.");
      setStep(2);
    } else {
      setMessage("모든 필드를 입력하세요.");
    }
  };




  const [loading, setLoading] = useState(false);

  const handleResendCode = async () => {
      if (!email) {
          setMessage("이메일을 입력하세요.");
          return;
      }
      setLoading(true);
      try {
          await UserAxios.get("/api/exist/email/" + email);
          setMessage("인증번호가 이메일로 발송되었습니다.");
      } catch (error) {
          setMessage("이메일 전송 실패. 다시 시도해 주세요.");
      } finally {
          setLoading(false);
      }
  };

  const [nicknameMessage, setNicknameMessage] = useState("");
const [isNicknameAvailable, setIsNicknameAvailable] = useState(null);

const handleNicknameCheck = async (e) => {
  e.preventDefault();
  if (!nickname) {
    setNicknameMessage("닉네임을 입력하세요.");
    return;
  }

  try {
    const response = await nicknameCheck(nickname)

    if (response.status===200) {
      setIsNicknameAvailable(true);
      setNicknameMessage("사용 가능한 닉네임입니다.");
    } else {
      setIsNicknameAvailable(false);
      setNicknameMessage("이미 사용 중인 닉네임입니다.");
    }
  } catch (error) {
    setNicknameMessage("서버 오류. 다시 시도해 주세요.");
  }
};


const handleComplete = async (e) => {
  e.preventDefault();  // 폼 제출 기본 동작 방지

  try {
    console.log("Submitting:", { password, nickname, email, description });

    const res = await signup({ password, nickname, email, description });
    console.log("Signup response:", res);  // 응답 로그 확인

    if (res.status === 200) {
      console.log("회원가입 성공:", res.data);
      setStep(3);  // 성공 시에만 3단계로 이동
    } else {
      setMessage("회원가입에 실패했습니다. 다시 시도해 주세요.");
    }
  } catch (error) {
    console.error("회원가입 중 오류 발생:", error);

    if (error.response) {
      setMessage(error.response.data.message || "서버 오류 발생");
    } else if (error.request) {
      setMessage("서버 응답이 없습니다. 네트워크 상태를 확인하세요.");
    } else {
      setMessage("요청 설정 오류 발생.");
    }
  }
};



  return (
    <div className="email-auth-container">
      <div className="email-auth-box">
        <div className="progress-bar">
          <div className={`step ${step === 1 ? 'active' : ''}`}>
            <span className={`step-number ${step === 1 ? 'active' : ''}`}>1</span>
            <span className="step-text">인증</span>
          </div>
          <span className="step-divider">⋯⋯</span>
          <div className={`step ${step === 2 ? 'active' : ''}`}>
            <span className={`step-number ${step === 2 ? 'active' : ''}`}>2</span>
            <span className="step-text">프로필</span>
          </div>
          <span className="step-divider">⋯⋯</span>
          <div className={`step ${step === 3 ? 'active' : ''}`}>
            <span className={`step-number ${step === 3 ? 'active' : ''}`}>3</span>
            <span className="step-text">연결하기</span>
          </div>
        </div>
        {step === 1 && (
          <div>
            <h2>이메일 인증</h2>
            <p>Code Master에 가입하기 위해서 이메일 인증이 필요합니다!</p>
            <form className="signup-form" onSubmit={handleSubmit}>
                <div className="form-row">
                  <label htmlFor="email">이메일</label>
                  <div className="input-group2">
                    <input
                      type="email"
                      id="email"
                      placeholder="이메일을 입력하세요"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      />
                    <button type="button" className="check-btn" onClick={handleResendCode} disabled={loading}>
                      {loading ? "전송 중..." : "인증번호 받기"}
                    </button>
                  </div>
                </div>
              <div className="form-row">
                <label htmlFor="code">인증번호</label>
                <div className="input-group2">
                  <input
                    type="text"
                    id="code"
                    placeholder="인증번호를 입력하세요"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    required
                  />
                  <button type="submit" className="signup-btn">인증하기</button>
                </div>
              </div>
            </form>

            {message && <p className="message">{message}</p>}
          </div>
        )}
        {step === 2 && (
          <div>
            <h2>프로필 입력</h2>
            <p>Code Master에 가입하기 위해 필요한 정보를 입력해주세요!</p>
            <form className={`signup-form ${step === 2 ? 'step-2' : ''}`} onSubmit={(e) => handleComplete(e)}>
            <div className="form-group">
            <label htmlFor="nickname">닉네임</label>
              <div className="input-group">
                <input
                  type="text"
                  id="nickname"
                  placeholder="닉네임 입력"
                  value={nickname}
                  onChange={(e) => setnickname(e.target.value)}
                  required
                />
                <button 
                  type="button" 
                  className="duplication-btn" 
                  onClick={handleNicknameCheck}
                >
                  중복확인
                </button>
              </div>
              <div className={`nickname-message ${isNicknameAvailable === null ? '' : isNicknameAvailable ? 'success' : 'error'}`}>
                {nicknameMessage}
              </div>

              <label htmlFor="password">비밀번호</label>
              <input 
              onChange={(e) => setpassword(e.target.value)}
              type="password" id="password" placeholder="비밀번호 입력" required />
              <label htmlFor="confirm-password">비밀번호 확인</label>
              <input type="password" id="confirm-password" placeholder="비밀번호 입력" required />
              <label htmlFor="description">자기소개</label>
              <input 
              onChange={(e) => setdescription(e.target.value)}
              type="text" id="description" />
              <div className="signup-agreement">
                <input type="checkbox" id="agreement" required/>
                <label htmlFor="agreement">
                회원 가입 시, 서비스 이용약관, 개인정보처리 방침에 동의하는 것으로 간주합니다.
                </label>
              </div>
              <button type="submit" className="signup-btn">회원가입</button>
              </div>
            </form>
          </div>
        )}
        {step === 3 && (
          <div className="signup-complete">
            <h1>회원가입 완료</h1>
            <p>000님 반가워요</p>
            <p>Code Master에서 다양한 기능을 사용해보세요!</p>
            <Link to="/login" className="signup-btn">로그인</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailAuth;
