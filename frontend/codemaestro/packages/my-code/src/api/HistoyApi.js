import UserAxios from "./userAxios";


// 내 그룹 기록 받아오기

export const GetGroupHistory = async (groupId) => {
    try {
        const response = await UserAxios.get(`/groups/${groupId}/conferences/my-stats`)
        console.log(response.data);
        
        return response.data
    } catch (error) {
        console.error("그룹회의 기록 가져오는 중 오류 발생", error);
    }
}


// 그룹회의 뒷면 메모 관련 api
export const GetMemo = async (historyId) => {
    try {
        const response = await UserAxios.get(`/study-records/${historyId}`)
        return response.data
    } catch (error) {
        console.error("메모모 가져오는 중 오류 발생", error);
    }
}



// 그룹회의 메모 작성
export const CreateMemo = async (payload) => {
    try {
        const historyId = payload.historyId
        const response = await UserAxios.post(`/study-records/${historyId}`,{studyContent:payload.studyContent})
        return response.data
    } catch (error) {
        console.error("그룹회의 메모 작성 중 오류 발생", error);
    }
}

// 그룹회의 메모 수정
export const PutMemo = async (historyId, payload) => {
    try {
        const response = await UserAxios.put(`/study-records/${historyId}`,payload)
        return response.data
    } catch (error) {
        console.error("그룹회의 메모 수정 중 오류 발생", error);
    }
}
// 그룹회의 메모 삭제
export const DeleteMemo = async (historyId) => {
    try {
        const response = await UserAxios.delete(`/study-records/${historyId}`)
        return response.data
    } catch (error) {
        console.error("그룹회의 메모 삭제 중 오류 발생", error);
    }
}