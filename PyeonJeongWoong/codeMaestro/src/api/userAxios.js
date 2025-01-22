import axios from "axios";
import tokenStorage from "../utils/tokenstorage";

// UserAxios 인스턴스 생성
const UserAxios = axios.create({
    baseURL: "http://192.168.31.194:8080", // 실제 API 주소로 변경
    timeout: 10000,
    withCredentials: true,
});

// // UserAxios 전용 인터셉터 설정
// UserAxios.interceptors.request.use(
//     (config) => {
//         // Authorization 헤더 추가
//         const token = tokenStorage.getAccessToken();
//         if (token) {
//             config.headers["Authorization"] = `Bearer ${token}`;
//         }
//         return config;
//     },
//     (error) => Promise.reject(error)
// );

// UserAxios.interceptors.response.use(
//     (response) => response,
//     async (error) => {
//         const originalRequest = error.config;

//         // 401 에러 및 무한 루프 방지
//         if (error.response?.status === 401 && !originalRequest._retry) {
//             originalRequest._retry = true;

//             try {
//                 // 리프레시 토큰으로 새 액세스 토큰 요청
//                 // API 주소가 안떠서 실제 API 주소로 교체해야 함.
//                 const refreshResponse = await axios.post(`${UserAxios.defaults.baseURL}/리프레시 토큰 받는 URL`, {}, { withCredentials: true });
//                 const newAccessToken = refreshResponse.data.accessToken;

//                 // 새 토큰 저장 및 헤더 업데이트
//                 tokenStorage.setAccessToken(newAccessToken);
//                 originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;

//                 // 실패한 요청 재시도
//                 return UserAxios(originalRequest);
//             } catch (refreshError) {
//                 console.error("Refresh token failed:", refreshError);
//                 return Promise.reject(refreshError);
//             }
//         }

//         return Promise.reject(error);
//     }
// );

export default UserAxios;
