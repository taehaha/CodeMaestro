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
  const [submitDisabled, setSubmitDisabled] = useState(false);

  const handleResendCode = async () => {
    if (!email) {
      setMessage("이메일을 입력하세요.");
      return;
    }
    setLoading(true);
    try {
      // emailCheck가 반환하는 값은 숫자(status code)입니다.
      const checkResponse = await emailCheck(email);
      console.log(checkResponse);
      
      // 중복 이메일인 경우 (예: 302 응답)
      if (checkResponse === 302) {
        setMessage("이미 존재하는 이메일입니다.");
        // 중복 이메일이면 버튼을 비활성화합니다.
        setSubmitDisabled(true);
        return;
      } else if (checkResponse === 200) {
        // 인증번호 전송 API 호출
        await UserAxios.post("/auth/verify/email", { email });
        setMessage("인증번호가 이메일로 발송되었습니다.");
      } else {
        setMessage("알 수 없는 응답입니다. 다시 시도해 주세요.");
      }
    } catch (error) {
      console.error(error);
      setMessage("이메일 전송 실패. 다시 시도해 주세요.");
    } finally {
      setLoading(false);
    }
  };
  
  

// 이메일 인증
  const [emailMessage, setEmailMessage] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // 필수 입력 필드 검증
    if (!email || !code) {
      setEmailMessage("모든 필드를 입력하세요.");
      return;
    }
  
    try {
      const res = await UserAxios.put("/auth/verify/email", { email, pin: code });
      console.log(res);
  
      if (res.status === 200) {
        setEmailMessage("이메일 인증이 완료되었습니다.");
        setStep(2);
      } else if (res.status === 400) {
        setEmailMessage("정확한 정보를 입력해주세요.");
      } else {
        setEmailMessage("알 수 없는 응답입니다. 다시 시도해 주세요.");
      }
    } catch (error) {
      console.error("이메일 인증 중 오류 발생:", error);
      // 에러 객체의 응답 코드에 따라 메시지를 업데이트할 수 있습니다.
      if (error.response && error.response.status === 400) {
        setEmailMessage("정확한 정보를 입력해주세요.");
      } else {
        setEmailMessage("서버 오류가 발생했습니다. 다시 시도해 주세요.");
      }
    }
  };
  




  const [loading, setLoading] = useState(false);

  // const handleResendCode = async () => {
  //     if (!email) {
  //         setMessage("이메일을 입력하세요.");
  //         return;
  //     }
  //     setLoading(true);
  //     try {
  //         await UserAxios.post("/auth/verify/email",{email});
  //         setMessage("인증번호가 이메일로 발송되었습니다.");
  //     } catch (error) {
  //         setMessage("이메일 전송 실패. 다시 시도해 주세요.");
  //     } finally {
  //         setLoading(false);
  //     }
  // };

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

    if (response===200) {
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
            onChange={(e) => {
              setEmail(e.target.value)
              setSubmitDisabled(false);
            }}
            required
          />

          <button
            type="button"
            className="check-btn"
            onClick={handleResendCode}
            disabled={loading}
          >
            {loading ? "전송 중..." : "인증번호 받기"}
          </button>
          {/* 중복체크 버튼 추가 */}
        </div>
        {message && <p className="message">{message}</p>}
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
        <button 
          type="submit" 
          className="signup-btn"
          disabled={submitDisabled}  // submitDisabled가 true면 버튼 비활성화
        >
          인증하기
        </button>
        </div>
      </div>
    </form>
    {emailMessage && <p className="message">{emailMessage}</p>}
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
            <p>{nickname}님 반가워요</p>
            <p>Code Master에서 다양한 기능을 사용해보세요!</p>
            <Link to="/login" className="signup-btn">로그인</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailAuth;
