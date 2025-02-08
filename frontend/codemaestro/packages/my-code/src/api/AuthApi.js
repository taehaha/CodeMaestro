import UserAxios,{baseURL} from "./userAxios";
import axios from "axios";
import Swal from 'sweetalert2';

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
        `${baseURL}/auth/signup`,
        formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        // withCredentials가 필요하다면 설정
        // withCredentials: true,
      }
      );
  
      return response;
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
      `${baseURL}/auth/signin`,
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
      const response = await UserAxios.delete("/auth/logout")
      return response.data
    } catch (error) {
      console.log("로그아웃 에러 발생",error);
    }
}

// 유저 정보 관련 : get, put, delete
export const getUserInfo = async () => {
    const response = await UserAxios.get(`/users/profile`,{})
    return response.data
}

export const putUserInfo = async (payload) => {
  try {
    // FormData 객체 생성
    const formData = new FormData();

    // 기존 payload의 키값으로로 FormData에 추가
    Object.keys(payload).forEach((key) => {
      formData.append(key, payload[key]);
    });

    // 요청 전송
    const response = await UserAxios.put('/users/profile', formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response;
  } catch (error) {
    console.error('유저 정보 수정 중 에러 발생:', error);
    throw error;
  }
};

//회원탈퇴 로직.
export const deleteUserInfo = async () => {
  const response = await UserAxios.delete( `/auth/quit`, {})
  return response
}

export const getNotification = async (userId) => {
  try {
    const response = await UserAxios.get(`/friends/requests/${userId}/pending`);    
    return response.data;
  } catch (error) {
    console.error("알림 가져오기 실패:", error);
    throw error;
  }
};


//이메일 인증: 회원가입
export const emailVerification = async (payload) =>{
  // try {
    
  // } catch (error) {
    
  // }
}
//이메일 인증: 비밀번호 찾기기


//이메일, 닉네임 중복 체크
export const emailCheck = async (email) =>{
  try {
    const result = await UserAxios.get(`/api/validate/email/${email}`)
    return result.status
  } catch (error) {
    console.error("이메일 중복 검사 중 오류 발견", error);
    
  }
}

export const nicknameCheck = async (nickname) =>{
  try {
    const result = await UserAxios.get(`/api/validate/nickname/${nickname}`)
    return result.status
  } catch (error) {
    console.error("닉네임 중복 검사 중 오류 발견", error);
  }
}