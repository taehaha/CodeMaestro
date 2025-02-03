import UserAxios from "./userAxios";
import axios from "axios";
// *중요: 모든 주소는 api 요청 정해지면 수정될 수 있음!!!
// 현재 1월 17일 기준 

export const signup = async (payload) => {

  
    try {
      console.log(payload);
      // 1) FormData 객체 생성
      const formData = new FormData();
      // 2) 텍스트 필드 추가
      formData.append("email", payload.email);
      formData.append("password", payload.password);
      formData.append("nickname", payload.nickname);
      formData.append("description", payload.description);
    
      // JSON 데이터 전송
      const response = await axios.post(
        "http://192.168.31.58:8080/auth/signup",
        formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        // withCredentials가 필요하다면 설정
        // withCredentials: true,
      }
      );
  
      return response.data;
    } catch (error) {
      console.error("Signup error:", error);
      throw error;
    }
  };

  export const signin = async (payload) => {
    // 1) FormData 객체 생성
    const formData = new FormData();
    // 2) 텍스트 필드 추가
    console.log(payload);
    
    formData.append("username", payload.username);
    formData.append("password", payload.password);
  
  
    // 3) Axios 요청
    const response = await axios.post(
      "http://192.168.31.58:8080/auth/signin",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        // withCredentials가 필요하다면 설정
        withCredentials: true,
      }
    );
  
    return response
  }

export const signout = async () => {
    try {
      const response = await UserAxios.post("/auth/logout")
      return response.data
    } catch (error) {
      console.log("로그아웃 에러 발생",error);
    }
}

// 아직 안정해진게 좀 있음(유저아이디 파라미터로 전해줄 것인가..)
// URL은 임시 URL 수정사항 있을시 URL만 바꿀 수 있도록 

// 2안
// export const getMyInfo = async () => {
//     const response = await UserAxios.get(`/profile/`,{
        // headers: {
        //     Authorization: `Bearer ${tokenStorage.getAccessToken()}`,
        //   },})
//     return response.data
// }

// 상세 정보는 바로 이렇게 쏘도록 설정.

export const getUserInfo = async () => {
    const response = await UserAxios.get(`/users/profile`,{})
    return response.data
}

export const getNotification = async (userId) => {
  try {
    const response = await UserAxios.get(`/friends/requests/${userId}/pending`);
    console.log(response);
    
    return response.data;
  } catch (error) {
    console.error("알림 가져오기 실패:", error);
    throw error;
  }
};

export const getFriendsNotification = async (userId) => {
  try {
    const response = await UserAxios.get(`/friends/requests/${userId}/pending`);
    console.log(response);
    
    return response.data;
  } catch (error) {
    console.error("알림 가져오기 실패:", error);
    throw error;
  }
};