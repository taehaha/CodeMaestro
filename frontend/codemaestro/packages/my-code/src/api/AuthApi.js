import UserAxios,{baseURL} from "./userAxios";
import axios from "axios";

// *중요: 모든 주소는 api 요청 정해지면 수정될 수 있음!!!
// 현재 1월 17일 기준 

export const signup = async (payload) => {

  
    try {
      // console.log(payload);
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
    // console.log(payload);
    
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
      console.error("로그아웃 에러 발생",error);
    }
}

// 유저 정보 관련 : get, put, delete
export const getUserInfo = async () => {
    const response = await UserAxios.get(`/users/profile`,{})
    return response.data
}

export const putUserInfo = async (payload) => {
  try {
    let dataToSend;
    // payload가 FormData라면 그대로 사용
    if (payload instanceof FormData) {
      dataToSend = payload;
    } else {
      // 그렇지 않다면 FormData로 변환 (파일이 없는 경우)
      dataToSend = new FormData();
      Object.keys(payload).forEach((key) => {
        dataToSend.append(key, payload[key]);
      });
    }

    const response = await UserAxios.put('/users/profile', dataToSend, {
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


//비밀번호 변경
export const putPassword = async (payload) => {
  const response = await UserAxios.patch(`/users/profile/password`, payload)

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
// eslint-disable-next-line no-unused-vars
export const emailVerification = async (payload) =>{
  // try {
    
  // } catch (error) {
    
  // }
}
//이메일 인증: 비밀번호 찾기


//이메일, 닉네임 중복 체크
export const emailCheck = async (email) => {
  try {
    const result = await UserAxios.get(`/api/validate/email/${email}`);
    return result.status; // 정상 응답: 200 등
  } catch (error) {
    console.error("이메일 중복 검사 중 오류 발견", error);
    // error.response가 있는 경우 해당 status 반환, 없으면 에러 재던짐
    if (error.response && error.response.status) {
      return error.response.status;
    }
    throw error;
  }
};

export const nicknameCheck = async (nickname) =>{
  try {
    const result = await UserAxios.get(`/api/validate/nickname/${nickname}`)
    return result.status
  } catch (error) {
    console.error("닉네임 중복 검사 중 오류 발견", error);
  }
}


