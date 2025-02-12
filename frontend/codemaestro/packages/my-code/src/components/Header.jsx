import React, {useContext, useEffect, useState} from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../reducer/userSlice';
import tokenStorage from '../utils/tokenstorage';
import { FaBell } from "react-icons/fa";
import NotificationModal from '../pages/Notifications/NotificationPage';
import { fetchNotifications } from '../reducer/notificationSlice';
import './Header.css';

function Header() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false)
  // user state에서 userId와 로그인 상태를 가져옴
  const { myInfo, isLoggedIn } = useSelector((state) => state.user);
  const userId = myInfo?.userId; // myInfo가 null이면 undefined

  useEffect(() => {
    // userId가 존재하고 로그인 상태일 때만 알림 요청
    if (isLoggedIn && userId) {
      dispatch(fetchNotifications(userId));
    }
  }, [dispatch, isLoggedIn, userId]);

  // 로그인 상태 확인
  const notifications = useSelector(state => state.notifications.items);
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

      <nav className={`menu-left ${menuOpen ? 'open' : ''}`}>
        <Link to="/meeting" onClick={closeMenu}>회의</Link>
        <Link to="/boards" onClick={closeMenu}>커뮤니티</Link>
      </nav>

      <div className="menu-right">
        <Link to="/mypage" onClick={closeMenu} className="mypage-link">
          <img src='/profile.png' alt="마이페이지"/>
        </Link>

        <button
          onClick={toggleNotifications}
          className="notification-btn btn text-2xl btn-ghost relative hover:bg-transparent hover:shadow-none hover:border-none"
        >
          <FaBell className="w-5 h-5"/>
                          {/* 알림 개수 표시 */}
            {notifications.length>0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
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
        </div>
    </header>
  );
}

export default Header;