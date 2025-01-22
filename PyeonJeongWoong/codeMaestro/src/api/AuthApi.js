import UserAxios from "./userAxios";
import axios from "axios";
// *중요: 모든 주소는 api 요청 정해지면 수정될 수 있음!!!
// 현재 1월 17일 기준 

export const signup = async (payload) => {
    try {
      console.log(payload);
  
      // JSON 데이터 전송
      const response = await axios.post(
        "http://192.168.31.194:8080/auth/signup",
        {
          email: "dd@dd.com",
          password: "asd",
          nickname: "asd21",
          description: "asdad",
        },
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
    formData.append("username", "tt@tt");
    formData.append("password", "tt");
  
    // 만약 파일도 함께 전송해야 한다면 (예: profileImage)
    // formData.append("profileImage", selectedFile);
  
    // 3) Axios 요청
    const response = await axios.post(
      "http://192.168.31.194:8080/auth/signin",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        // withCredentials가 필요하다면 설정
        // withCredentials: true,
      }
    );
  
    console.log(response);
  }
export const signout = async () => {
    const response = await UserAxios.post("/auth/signout")
    return response.data
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
    const response = await UserAxios.get(`/auth/profile`,{})
    return response.data
}

export const getNotification = async () => {
    try {
        const response = await UserAxios.get('/auth/notifications', {})
    return response.data
    } catch (error) {
        console.error(error);
    }
}