import './Header.css';
import Swal from "sweetalert2";
import { useDispatch, useSelector } from 'react-redux';
import { getMyInfo, logout } from "../reducer/userSlice"
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { persistor } from '../reducer/store';

function Header() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const isLoggedIn = useSelector((state) => state.user.isLoggedIn); 

  const handleLogout = () => {
    Swal.fire({
      title:"로그아웃",
      text:"로그아웃이 완료되었습니다.",
      icon:"success",
    }).then(()=>{
      dispatch(logout())
      persistor.purge().then(()=>{
        navigate("/")
      })

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
  
      dispatch(getMyInfo(dummyUser))
    })
  }
  return (
    <header className="header">
      <div className="logo" ><Link to="/">Code Maestro</Link></div>
      <nav className="menu">
        <Link to="/meeting">Meeting</Link>
        <Link to="/profile">Profile</Link>
        <a href="product">Product</a>
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
