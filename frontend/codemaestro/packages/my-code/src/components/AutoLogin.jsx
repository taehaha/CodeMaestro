import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import tokenStorage from '../utils/tokenstorage';
import { baseURL } from '../api/userAxios';

const OAuth2RedirectHandler = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // URL에서 쿼리 파라미터 파싱
    const params = new URLSearchParams(location.search);
    const refreshToken = params.get('refresh');
 
    if (refreshToken) {
      // 만약 access token 교환 API가 있다면 호출
      axios.post(`${baseURL}/auth/reissue`, { refreshToken }, { withCredentials: true })
        .then(response => {
          // 예시: 헤더에 access token이 담겨 있다고 가정
          const accessToken = response.headers.access; // 또는 response.data.accessToken;
          tokenStorage.setAccessToken(accessToken);
        })
        .catch(error => {
          console.error('토큰 갱신 실패', error);
          // 실패 처리 로직 (예: 로그아웃, 에러 메시지 표시 등)
        });

      // URL에서 토큰 파라미터 제거 (replace 옵션으로 브라우저 기록에도 남지 않게 함)

      // 인증 후 이동할 페이지로 리다이렉트 (예: 홈 페이지)
      navigate('/');
    }
  }, [location, navigate]);

  return <div>로그인 처리 중...</div>;
};

export default OAuth2RedirectHandler;
