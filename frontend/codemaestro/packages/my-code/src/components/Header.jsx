import React, { useRef, useEffect, useState } from 'react';
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
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef(null);
  const bellButtonRef = useRef(null);
  const menuRef = useRef(null);
  const hamburgerRef = useRef(null);
  const userId = useSelector((state) => state.user.myInfo?.userId);
 
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
    window.location.href = "/"; // 메인 페이지로 이동
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
// 🔥 햄버거 바 외부 클릭 시 닫기
useEffect(() => {
  const handleClickOutside = (event) => {
    if (
      menuOpen &&
      menuRef.current &&
      !menuRef.current.contains(event.target) && // 메뉴 영역 외부 클릭 감지
      hamburgerRef.current &&
      !hamburgerRef.current.contains(event.target) // 햄버거 버튼 제외
    ) {
      setMenuOpen(false);
    }
  };

  if (menuOpen) {
    document.addEventListener("mousedown", handleClickOutside);
  }

  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, [menuOpen]);
   // 🔥 모달 외부 클릭 시 닫기
   useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target) && // 모달 바깥 클릭
        bellButtonRef.current &&
        !bellButtonRef.current.contains(event.target) // 🔥 알림 버튼 제외
      ) {
        setShowNotifications(false);
      }
    };

    if (showNotifications) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showNotifications]);

  return (
    <header className="header">
      <img
      src={'/Logo.png'} 
      alt="Code Maestro"
      onClick={handleLogoClick} 
      className="logo"/>

      <button ref={hamburgerRef} className="hamburger-btn" onClick={toggleMenu}>☰</button>

      <nav ref={menuRef} className={`menu-left ${menuOpen ? 'open' : ''}`}>
        <Link to="/meeting" onClick={closeMenu}>회의</Link>
        <Link to="/boards" onClick={closeMenu}>커뮤니티</Link>
      </nav>

      <div className="menu-right">
        <Link to="/mypage" onClick={closeMenu} className="mypage-link">
          <img src='/profile.png' alt="마이페이지"/>
        </Link>

        <div className="header-container">
        <button
          ref={bellButtonRef}
          onClick={toggleNotifications}
          className="notification-btn btn text-2xl btn-ghost relative hover:bg-transparent hover:shadow-none hover:border-none"
        >
          <FaBell className="w-5 h-5"/>
                          {/* 알림 개수 표시 */}
            {notifications.length>0 && (
              <span className="notification-badge absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {notifications.length}
              </span>
            )}
        </button>
              {showNotifications && (
                <div ref={notificationRef}>
                  <NotificationModal onClose={toggleNotifications}/>
                </div>
      )}
      </div>

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