import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { getMyInfo } from "../../reducer/userSlice"
import tokenStorage from "../../utils/tokenstorage";
import { Link } from 'react-router-dom';
import UserAxios from '../../api/userAxios';
import { loginUser } from '../../reducer/userSlice';
import './LoginPage.css';
import KaKaoLoginButton from "../../components/KaKaoLogin";
import NaverLoginButton from "../../components/NaverLogin";
import GoogleLoginButton from "../../components/GoogleLogin";import { signin } from '../../api/AuthApi';
import axios from 'axios';
import Swal from "sweetalert2";
import { useNavigate } from 'react-router-dom';

function LoginPage() {
  const isLoggedIn = useSelector((state) => {
    console.log("현재 로그인 상태 : ", state.user.isLoggedIn);
    return state.user.isLoggedIn});
  const dispatch = useDispatch();
  const navigate = useNavigate()
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { username: email, password };
  
    try {
      const response = await dispatch(loginUser(payload)).unwrap();
  
      if (response.status === 200) {
        const userName = response.data.userName;
        dispatch(getMyInfo());
        Swal.fire({
          title: "로그인 성공",
          text: "코드 마에스트로에 오신 것을 환영합니다!",
          icon: "success",
          iconColor:"#5FD87D",
          width: "500px",
          background: "#f8f9fa", // 연한 회색 배경
          confirmButtonColor: "#FFCC00",
          confirmButtonText: "확인",
          customClass: {
            popup: "swal-custom-popup",       // 전체 팝업 스타일
            title: "swal-custom-title",       // 제목 스타일
            htmlContainer: "swal-custom-text", // 본문 텍스트 스타일
            confirmButton: "swal-custom-button" // 버튼 스타일
          }
        }).then(() => navigate("/"));
      }
    } catch (error) {
      console.error("로그인 실패:", error);
      Swal.fire({
        title: "로그인 실패",
        text: "아이디 또는 비밀번호를 확인해주세요.",
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
  };
  

  const token = tokenStorage.getAccessToken();
  useEffect(() => {
    if (token) {
      dispatch(getMyInfo());
    }
  }, [token, dispatch]);

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>로그인</h1>
        <p>코드 마에스트로에 오신 것을 환영합니다!</p>
        <form onSubmit={handleSubmit}>
          <div className="login-form">
            <label htmlFor="email">이메일</label>
            <input type="email" id="email" placeholder="이메일 입력" value={email} 
            onChange={(e) => setEmail(e.target.value)}/>
          </div>
          <div className="login-form">
            <label htmlFor="password">비밀번호</label>
            <Link to="/forgotpassword" className="forgot-password">비밀번호를 잊으셨나요?</Link>

            <input type="password" id="password" placeholder="비밀번호 입력" 
            value={password} onChange={(e) => setPassword(e.target.value)}/>
          </div>
          <button type="submit" className="login-btn">로그인</button>
        </form>
        <div className="social-login">
          <p>간편 로그인</p>
          <div className="social-icons">
            <NaverLoginButton />
            <KaKaoLoginButton />
            {/* <GoogleLoginButton /> */}
          </div>
        </div>
        <p className="signup">
          계정이 없으신가요?
          <Link to="/signup"> 회원가입</Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
