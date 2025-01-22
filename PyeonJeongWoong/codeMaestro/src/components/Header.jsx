import './Header.css';
import Swal from "sweetalert2";
import { useDispatch, useSelector } from 'react-redux';
import { logout,TempgetMyInfo } from "../reducer/userSlice"
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { persistor } from '../reducer/store';
import { FaBell } from "react-icons/fa";
import NotificationModal from '../pages/Notifications/NotificationPage';
import { useContext, useState } from 'react';
import { NotificationsContext } from '../context/NotificationContext';
function Header() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const isLoggedIn = useSelector((state) => state.user.isLoggedIn); 
  
  const [showNotifications, setShowNotifications] = useState(false)
  const { notifications } = useContext(NotificationsContext);
  const handleLogout = () => {
    navigate("/")
    Swal.fire({
      title:"로그아웃",
      text:"로그아웃이 완료되었습니다.",
      icon:"success",
    }).then(()=>{
      dispatch(logout())
      persistor.purge()

    })
  }
  const handleLogin = () => {    
    Swal.fire({
      title:"가짜 로그인",
      text:"원래 로그인 페이지 이동해야 하지만, 로그인 페이지에서 성공하고 토큰을 받았다 치고, 받은 토큰으로 유저정보 요청 api 보내서 res로 받았다 칠게요.",
      confirmButtonText:"확인",
    }).then(()=>{
      const dummyUser = {
        id: 'kopybara8421',
        name: '익명의 카피바라 8421',
        email: 'test@test.com',
        description: '오늘도 열심히 코딩합시다',
        tier: 27,
        // profile_image_url,
}
  
      dispatch(TempgetMyInfo(dummyUser))
      navigate("/")
    })
  }
  const toggleNotifications = () => {
    setShowNotifications(!showNotifications)
  }

  return (
    <header className="header">
      <div className="logo" ><Link to="/">Code Maestro</Link></div>
      <nav className="menu">
        <Link to="/meeting" className='btn btn-ghost'>Meeting</Link>
        <Link to="/profile" className='btn btn-ghost'>Profile</Link>
        <div className="relative">
      {/* 알림 버튼 */}
      <button
        onClick={toggleNotifications}
        className="btn text-2xl btn-ghost relative"
      >
        <FaBell />
      </button>
      {/* 알림 개수 표시 */}
      {notifications.length > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
          {notifications.length}
        </span>
      )}
    </div>
        {showNotifications && (
            <NotificationModal onClose={toggleNotifications}/>
      )}

        {!isLoggedIn && (
            <>
            <button className="login-btn" onClick={handleLogin}>Log in</button> <button className="join-btn">Join</button>
            </>
        )}
        {isLoggedIn && (<button className="login-btn" onClick={handleLogout}>Logout</button>)}

      </nav>
    </header>
  );
}

export default Header;
