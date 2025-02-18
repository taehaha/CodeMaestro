import { useState } from "react";
import { Link } from "react-router-dom";
import UserAxios from "../../api/userAxios";
import { signup, emailCheck, nicknameCheck } from "../../api/AuthApi";
import "./EmailAuth.css";
import SignUpValidationSchema from "./SignUpValidationSchema";
import { Formik, Form, Field, ErrorMessage } from "formik";
import Swal from "sweetalert2";

const EmailAuth = () => {
  // Step 1 (이메일 인증) 관련 상태
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [step, setStep] = useState(1);
  const [submitDisabled, setSubmitDisabled] = useState(false);
  const [loading, setLoading] = useState(false);

  // 회원가입 완료 후 표시할 닉네임 (Step 3)
  const [registeredNickname, setRegisteredNickname] = useState("");

  // 닉네임 중복 체크 상태
  const [duplicateCheck, setDuplicateCheck] = useState(false); // 기본값은 false

  // 인증번호 전송 (이메일 중복 체크 및 인증번호 요청)
  const handleResendCode = async () => {
    if (!email) {
      setMessage("이메일을 입력하세요.");
      return;
    }
    setLoading(true);
    try {
      const checkResponse = await emailCheck(email);
      if (checkResponse === 302) {
        setMessage("이미 존재하는 이메일입니다.");
        setSubmitDisabled(true);
        return;
      } else if (checkResponse === 200) {
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

  // 이메일 인증 제출
  const handleEmailVerification = async (e) => {
    e.preventDefault();
    if (!email || !code) {
      setEmailMessage("모든 필드를 입력하세요.");
      return;
    }
    try {
      const res = await UserAxios.put("/auth/verify/email", { email, pin: code });
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
      if (error.response && error.response.status === 400) {
        setEmailMessage("정확한 정보를 입력해주세요.");
      } else {
        setEmailMessage("서버 오류가 발생했습니다. 다시 시도해 주세요.");
      }
    }
  };

  return (
    <div className="email-auth-container">
      <div className="email-auth-box">
        {/* 진행 단계 표시 */}
        <div className="progress-bar">
          <div className={`step ${step === 1 ? "active" : ""}`}>
            <span className={`step-number ${step === 1 ? "active" : ""}`}>1</span>
            <span className="step-text">인증</span>
          </div>
          <span className="step-divider">⋯⋯</span>
          <div className={`step ${step === 2 ? "active" : ""}`}>
            <span className={`step-number ${step === 2 ? "active" : ""}`}>2</span>
            <span className="step-text">프로필</span>
          </div>
          <span className="step-divider">⋯⋯</span>
          <div className={`step ${step === 3 ? "active" : ""}`}>
            <span className={`step-number ${step === 3 ? "active" : ""}`}>3</span>
            <span className="step-text">연결하기</span>
          </div>
        </div>

        {/* Step 1: 이메일 인증 */}
        {step === 1 && (
          <div>
            <h2>이메일 인증</h2>
            <p>Code Master에 가입하기 위해서 이메일 인증이 필요합니다!</p>
            <form className="signup-form" onSubmit={handleEmailVerification}>
              <div className="form-row">
                <label htmlFor="email">이메일</label>
                <div className="input-group2">
                  <input
                    type="email"
                    id="email"
                    placeholder="이메일을 입력하세요"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
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
                  <button type="submit" className="signup-btn" disabled={submitDisabled}>
                    인증하기
                  </button>
                </div>
              </div>
            </form>
            {emailMessage && <p className="message">{emailMessage}</p>}
          </div>
        )}

        {/* Step 2: 프로필 입력 (Formik 사용) */}
        {step === 2 && (
          <div>
            <h2>프로필 입력</h2>
            <p>Code Master에 가입하기 위해 필요한 정보를 입력해주세요!</p>
            <Formik
              initialValues={{
                nickname: "",
                password: "",
                description: "",
                agreement: false,
              }}
              validationSchema={SignUpValidationSchema}
              onSubmit={async (values, { setSubmitting, setStatus }) => {
                // duplicateCheck가 false일 경우, 가입 진행되지 않도록 함
                if (!duplicateCheck) {
                  setStatus("닉네임 중복 확인을 먼저 해주세요.");
                  setSubmitting(false);
                  return;
                }
                try {
                  // 이메일 정보도 함께 전달하여 회원가입 API 호출
                  const res = await signup({
                    email,
                    nickname: values.nickname,
                    password: values.password,
                    description: values.description,
                  });
                  if (res.status === 200) {
                    setRegisteredNickname(values.nickname);
                    setStep(3);
                  } else {
                    setStatus("회원가입에 실패했습니다. 다시 시도해 주세요.");
                  }
                } catch (error) {
                  setStatus(
                    (error.response && error.response.data.message) ||
                      "서버 오류가 발생했습니다."
                  );
                }
                setSubmitting(false);
              }}
            >
              {({ isSubmitting, status, values, setFieldError, setFieldTouched }) => (
                <Form className="signup-form step-2">
                  <div className="form-group">
                    <label htmlFor="nickname">닉네임</label>
                    <div className="input-group">
                      <Field
                        type="text"
                        id="nickname"
                        name="nickname"
                        placeholder="닉네임 입력"
                      />
                      <button
                        type="button"
                        className="duplication-btn"
                        onClick={async () => {
                          if (!values.nickname) {
                            setFieldError("nickname", "닉네임을 입력하세요.");
                            return;
                          }
                          try {
                            const response = await nicknameCheck(values.nickname);

                            if (response === 200) {
                              // 사용 가능하면 에러 메시지를 지웁니다.
                              Swal.fire({
                                title: "사용이 가능한 닉네임입니다.",
                                icon: "success",
                              });
                              setDuplicateCheck(true); // 중복 체크가 통과하면 true로 설정
                              setFieldError("nickname", "");
                              setFieldTouched("nickname", true, false);
                            } else {
                              setFieldError("nickname", "이미 사용 중인 닉네임입니다.");
                              setDuplicateCheck(false); // 중복이면 false
                            }
                          } catch (error) {
                            setFieldError("nickname", "서버 오류. 다시 시도해 주세요.");
                            setDuplicateCheck(false); // 오류 발생 시 false
                          }
                        }}
                      >
                        중복확인
                      </button>
                    </div>
                    <ErrorMessage name="nickname" component="div" className="error-message" />

                    <label htmlFor="password">비밀번호</label>
                    <Field
                      type="password"
                      id="password"
                      name="password"
                      placeholder="비밀번호 입력"
                    />

                    <ErrorMessage name="password" component="div" className="error-message" />

                    <label htmlFor="description">자기소개</label>
                    <Field
                      type="text"
                      id="description"
                      name="description"
                      placeholder="자기소개 입력 (최대 255자)"
                    />
                    <ErrorMessage name="description" component="div" className="error-message" />

                    <div className="signup-agreement">
                      <Field type="checkbox" id="agreement" name="agreement" />
                      <label htmlFor="agreement">
                        회원 가입 시, 서비스 이용약관 및 개인정보처리 방침에 동의하는 것으로 간주합니다.
                      </label>
                    </div>
                    <ErrorMessage name="agreement" component="div" className="error-message mt-0" />

                    {status && <div className="status-message">{status}</div>}

                    <button type="submit" className="auth-signup-btn" disabled={isSubmitting}>
                      회원가입
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        )}

        {/* Step 3: 회원가입 완료 */}
        {step === 3 && (
          <div className="signup-complete">
            <h1>회원가입 완료</h1>
            <p>{registeredNickname}님 반가워요</p>
            <p>Code Master에서 다양한 기능을 사용해보세요!</p>
            <Link to="/login" className="signup-btn">
              로그인
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailAuth;
