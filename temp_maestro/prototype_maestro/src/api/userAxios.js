import axios from "axios";
import tokenStorage from "../utils/tokenstorage";
const UserAxios = axios.create({
    baseURL: "https://codemaestro.site/auth", // 이 부분 실제 api 주소 나올때 변경
    timeout: 10000,
    withCredentials: true,
})

axios.interceptors.request.use(
    (response) => response,
    async (error) =>{
        const originalRequest = error.config;
        // 무한루프 401 방지용
        if (error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            
            try {
                // 백엔드에 엑세스토큰을 새로 요청하여, 재요청
                const response = await axios.post(`${UserAxios.baseURL}/리프레시 토큰 받는 URL`,{},{withCredentials:true})
                const newAccessToken = response.data.accessToken;
                tokenStorage.setAccessToken(newAccessToken)
                originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
                return UserAxios(originalRequest)
                } 

            catch(refreshError) {
                console.error(refreshError)
                return Promise.reject(refreshError)
                }
        };
        return Promise.reject(error);
    }
);

export default UserAxios;
