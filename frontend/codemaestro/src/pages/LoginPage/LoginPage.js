import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { getMyInfo, loginUser } from '../../store/userSlice';
import tokenStorage from "../../utils/tokenstorage";
import { Link } from 'react-router-dom';
import UserAxios from '../../api/userAxios';
import './LoginPage.css';
import naver from '../../assets/images/icons/naver.png'
import kakao from '../../assets/images/icons/kakao.png'
import google from '../../assets/images/icons/google.png'
import { signin } from '../../api/AuthApi';
import axios from 'axios';
import Swal from "sweetalert2";
import { useNavigate } from 'react-router-dom';

function LoginPage() {
  const isLoggedIn = useSelector((state) => {
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
      console.log("로그인 성공", response);
  
      if (response.status === 200) {
        dispatch(getMyInfo());
        Swal.fire({
          title: "로그인 성공",
          icon: "success",
        }).then(() => navigate("/"));
      }
    } catch (error) {
      console.error("로그인 실패:", error);
      Swal.fire({
        title: "로그인 실패",
        text: "아이디 또는 비밀번호를 확인해주세요.",
        icon: "error",
      });
    }
  };
  
  return (
    <div className="login-container">
      <div className="login-box">
        <h1>로그인</h1>
        <p>Code Maestro에 오신 것을 환영합니다!</p>
        <form onSubmit={handleSubmit}>
          <div className="login-form">
            <label htmlFor="email">이메일</label>
            <input type="email" id="email" placeholder="이메일 입력" value={email} 
            onChange={(e) => setEmail(e.target.value)}/>
          </div>
          <div className="login-form">
            <label htmlFor="password">비밀번호</label>
            <Link to="/forgotpassword" className="forgot-password">비밀번호를 잊으셨나요?</Link>

            <input type="current-password" id="password" placeholder="비밀번호 입력" 
            value={password} onChange={(e) => setPassword(e.target.value)}/>
          </div>
          <button type="submit" className="login-btn">로그인</button>
        </form>
        <div className="social-login">
          <p>간편 로그인</p>
          <div className="social-icons">
            <a href="https://naver.com" className="social-item" target="_blank" rel="noopener noreferrer">
              <img src={naver} alt="네이버" />
              <span>네이버</span>
            </a>
            <a href="https://kakao.com" className="social-item" target="_blank" rel="noopener noreferrer">
              <img src={kakao} alt="카카오톡" />
              <span>카카오톡</span>
            </a>
            <a href="https://google.com" className="social-item" target="_blank" rel="noopener noreferrer">
              <img src={google} alt="구글" />
              <span>구글</span>
            </a>
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
