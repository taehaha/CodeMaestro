// src/api/UserAxios.js
import axios from "axios";
import Swal from "sweetalert2";
import tokenStorage from "../utils/tokenstorage";
import { setLoggedOut } from "../reducer/userSlice";
// =======================================
// ① 일반 요청을 담당하는 UserAxios 인스턴스
// =======================================
// export const baseURL = "https://api.codemaestro.site"
// export const baseURL = "https://test.api.codemaestro.site"
export const baseURL = "http://192.168.31.58:8080"
const UserAxios = axios.create({
  baseURL:baseURL,  // 실제 API 주소로 변경
  timeout: 3000,                      
  withCredentials: true,                // 쿠키 전송 허용
});

// =======================================
// ② Refresh 전용 요청을 담당하는 RefreshAxios 인스턴스
//    - 기존 토큰이 만료된 상태에서 요청할 수 있으므로
//    - 불필요한 인터셉터를 배제해 별도로 관리
// =======================================
const RefreshAxios = axios.create({
  baseURL: baseURL,
  timeout: 3000,
  withCredentials: true,
});

// ---------------------------------------
// [request interceptor]
//  - 매 요청마다 AccessToken을 헤더에 실어 보냄
// ---------------------------------------
UserAxios.interceptors.request.use(
 async (config) => {
    const token = await tokenStorage.getAccessToken();
    if (token) {
      config.headers["Access"] = `${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ---------------------------------------
// [response interceptor]
//  - 401(토큰 만료) 발생 시 → Refresh 토큰으로 재발급 시도
//  - 무한 루프 방지를 위해 _retry 플래그 사용
// ---------------------------------------
UserAxios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 무한 루프 방지
    if (originalRequest._retry) {
      return Promise.reject(error);
    }

    // 401 Unauthorized 에러 처리
    if (error.response?.status === 401) {
      originalRequest._retry = true;

      // 만약 '/auth/reissue' 요청 자체가 401을 리턴한다면 → Refresh Token도 만료된 것으로 간주 → 즉시 로그아웃
      if (originalRequest.url.includes("/auth/reissue")) {
        return handleLogoutAndRedirect();
      }

      try {
        console.log("🔄 401 발생 → Refresh Token으로 재발급 시도");

        // Refresh Token으로 Access Token 재발급
        // (withCredentials: true 유지)
        const refreshResponse = await RefreshAxios.post("/auth/reissue", null);

        // 새 Access Token 추출
        const newAccessToken = refreshResponse?.headers?.access;
        if (!newAccessToken) {
          // accessToken이 내려오지 않으면 에러로 처리
          throw new Error("새로운 Access Token이 응답에 없습니다.");
        }

        // 새 Access Token을 로컬에 저장
        tokenStorage.setAccessToken(newAccessToken);

        // 원래 요청에 새 토큰을 실어서 재시도
        originalRequest.headers["Access"] = `${newAccessToken}`;
        return UserAxios(originalRequest);
      } catch (refreshError) {
        console.error("❌ Refresh Token 재발급 실패:", refreshError);
        return handleLogoutAndRedirect();
      }
    }

    // 그 외 에러는 그대로 throw
    return Promise.reject(error);
  }
);

// ---------------------------------------
// [재발급 실패 or 만료 시 → 로그아웃 & 알림 처리]
// ---------------------------------------
async function handleLogoutAndRedirect() {
  const { default: store } = await import("../reducer/store");
  //userSlice store userAxios 순환참조를 피하기 위한 동적 호출

  tokenStorage.removeAccessToken(); // 로컬 토큰 삭제
  
  // 사용자 알림
  await Swal.fire({
    title: "세션 만료",
    text: "로그인 세션이 만료되었습니다. 다시 로그인해주세요.",
    icon: "warning",
    confirmButtonText: "확인",
  });

  // 로그인 페이지로 강제 이동
  store.dispatch(setLoggedOut());
  window.location.href = "/login";
  return Promise.reject(); 
}

export default UserAxios;
