import React, {useContext, useState} from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../reducer/userSlice';
import tokenStorage from '../utils/tokenstorage';
import { FaBell } from "react-icons/fa";
import NotificationModal from '../pages/Notifications/NotificationPage';
import { NotificationsContext } from '../context/NotificationContext';
import './Header.css';

function Header() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false)
  const { notifications } = useContext(NotificationsContext);

  // 로그인 상태 확인
  const isLoggedIn = useSelector((state) => state.user.isLoggedIn);
  // 로그아웃
  const handelLogout = () => {
    dispatch(logoutUser());
  }
  
  const handleLogoClick = () => {
    navigate('/'); // 메인 페이지로 이동
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications)
  }

  return (
    <header className="header">
      <img
      src={'/Logo.png'} 
      alt="Code Maestro"
      onClick={handleLogoClick} 
      className="logo"/>

      <button className="hamburger-btn" onClick={toggleMenu}>☰</button>

      <nav className={`menu ${menuOpen ? 'open' : ''}`}>
        <Link to="/meeting" onClick={closeMenu}>회의</Link>
        <Link to="/mypage" onClick={closeMenu}>마이페이지</Link>
        <Link to="/boards" onClick={closeMenu}>커뮤니티</Link>
            <button
              onClick={toggleNotifications}
              className="btn text-2xl btn-ghost relative"
            >
        <FaBell className="w-5 h-5"/>
                          {/* 알림 개수 표시 */}
            {notifications && (
              <span className="absolute -top-0.5 right-1 bg-red-500 text-white text-xs font-bold rounded-full h-3.5 w-3.5 flex items-center justify-center">
                {notifications.length}
              </span>
            )}
            </button>

                    {showNotifications && (
                      <div>
                        <NotificationModal onClose={toggleNotifications}/>
                      </div>
      )}
        {isLoggedIn ? (
          <button className='header-logout-btn' onClick={handelLogout}>로그아웃</button>
        ) : (
          <div className="auth-buttons">
            <Link to="/login" className="header-login-btn" onClick={closeMenu}>로그인</Link>
            <Link to="/signup" className="header-signup-btn" onClick={closeMenu}>회원가입</Link>
          </div>
        )}
      </nav>
    </header>
  );
}

export default Header;