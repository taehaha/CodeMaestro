// OAuth2RedirectHandler.js
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import tokenStorage from '../utils/tokenstorage';
import { baseURL } from '../api/userAxios';
import { useDispatch } from 'react-redux';
import { getMyInfo, setLoggedIn } from '../reducer/userSlice';

const OAuth2RedirectHandler = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    // URL에서 쿼리 파라미터 파싱
    const params = new URLSearchParams(location.search);
    const refreshToken = params.get('refresh');
 
    if (refreshToken) {
      // refresh 토큰을 백엔드로 전달하여 access token 교환
      axios.post(
        `${baseURL}/auth/reissue`,
        { refreshToken }, // refresh 토큰을 데이터에 포함
        { withCredentials: true } // 쿠키 관련 처리를 위해 설정
      )
      .then(response => {
        // 예시: 헤더 또는 response.data에 access token이 담겨 있다고 가정
        const accessToken = response.headers.access || response.data.accessToken;
        if (accessToken) {
          // 발급받은 access token 저장
          tokenStorage.setAccessToken(accessToken);
          // Redux에 사용자 정보를 업데이트 및 로그인 상태를 true로 설정
          dispatch(getMyInfo());
          dispatch(setLoggedIn(true));
        }
        // 토큰 처리가 완료되면 홈 페이지로 리다이렉트
        navigate('/', { replace: true });
      })
      .catch(error => {
        console.error('토큰 갱신 실패:', error);
        // 실패 시 추가 로직 처리 (예: 에러 메시지, 로그아웃 처리 등)
      });
    } else {
      // refresh 토큰이 없는 경우 기본 페이지로 이동
      navigate('/', { replace: true });
    }
  }, [location, navigate, dispatch]);

  return <div>로그인 처리 중...</div>;
};

export default OAuth2RedirectHandler;
