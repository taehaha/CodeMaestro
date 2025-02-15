import UserAxios from "./userAxios"

// 방 리스트 찾기
export const getRoomList = async () => {
    try {
        const response =await UserAxios.get("/conference") // 방 id, 썸네일, 제목, 설명, 비밀번호방 여부 가져옴
        return response.data;

    } catch (error) {
        console.error(error);
    }
}

// 방 디테일 찾기
export const getRoomDetail = async (roomId) => {
    try {
        const response = await UserAxios.get(`/rooms/${roomId}`) // 참가자 정보 등 상세데이터?
        return response.data
    } catch (error) {
        console.log(error);
        
    }
}

// 생성 수정 삭제
export const createRoom = async (payload) => {
    try {
      // 1) FormData 객체 생성
      const formData = new FormData();
// 2) FormData에 필드 추가
      // 문자열(또는 숫자)은 그대로 append
      formData.append("title", payload.title);
      formData.append("description", payload.description ?? "");
      formData.append("accessCode", payload.accessCode ?? null);
      
      // 배열, 객체 형태로 보내야 한다면 JSON.stringify를 사용하는 방법이 일반적임
      if (payload.tagNameList && payload.tagNameList.length > 0) {
        formData.append("tagNameList", JSON.stringify(payload.tagNameList));
      } 
      
      // 3) 이미지(파일) 데이터 추가
      //    payload.thumbnail이 File이나 Blob 형태인지 확인 필요
      if (payload.thumbnail) {
        formData.append("thumbnail", payload.thumbnail);
      }
  
      // 4) Axios로 multipart/form-data 전송
      const response = await UserAxios.post(`/conference/create`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
  
      // 5) 응답
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  };


  export const putRoom = async (roomId, payload) => {
    try {
      // 1) FormData 객체 생성
      const formData = new FormData();
  
      // 2) FormData에 필드 추가
      formData.append("title", payload.title);
      formData.append("description", payload.description ?? "");
      formData.append("accessCode", payload.accessCode ?? null);
      
      // 배열, 객체 형태 데이터는 JSON.stringify
      formData.append("tagNameList", JSON.stringify(payload.tagNameList ?? []));
  
      // 3) 이미지(파일) 데이터가 있다면 추가
      if (payload.thumbnail) {
        formData.append("thumbnail", payload.thumbnail);
      }
  
      // 4) Axios로 multipart/form-data 형식으로 PUT 요청 전송
      const response = await UserAxios.put(`/rooms/${roomId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
  
      // 5) 응답
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  };
  

export const deleteRoom = async (roomId) => {
    try {
        const response = await UserAxios.delete(`/conference/${roomId}`)
        return (await response).data
    } catch (error) {
        console.log(error);
        
    }
}