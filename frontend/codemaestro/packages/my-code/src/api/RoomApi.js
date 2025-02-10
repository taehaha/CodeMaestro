import UserAxios from "./userAxios"

// 방 리스트 찾기
export const getRoomList = async () => {
    try {
        const response =await UserAxios.get("/rooms") // 방 id, 썸네일, 제목, 설명, 비밀번호방 여부 가져옴
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
        const response = await UserAxios.post(`/conference/create`, payload,
        )
        return response.data
    } catch (error) {
        console.log(error);
        
    }
}

export const putRoom = async (roomId, data) => {
    try {
        const response = await UserAxios.put(`/rooms/${roomId}`, data)
        return response.data
    } catch (error) {
        console.log(error);
        
    }
}

export const deleteRoom = async (roomId) => {
    try {
        const response = await UserAxios.delete(`/rooms/${roomId}`)
        return (await response).data
    } catch (error) {
        console.log(error);
        
    }
}