import UserAxios from "./userAxios";

    // 랭킹 그룹 가져오기
    // 더미데이터 아직 사용중임.
    export const getGroupList = async () => {
        try {
            const response = await UserAxios.get('/groups',{
                params:{
                    sort:"rank",
                    limit:10,
                    friends:false
                }
            })
    
            return response.data
        } catch (error) {
            console.error("랭킹 불러오는 중 오류 발생", error);
        }
    }

    export const getMyGroupList = async (userId) => {
        try {
            const response = await UserAxios.get(`/groups/user/${userId}`, {
            });   
            return response.data;
        } catch (error) {
            console.error("내 그룹 불러오는 중 오류 발생", error);
        }
    };
    

    // 그룹 수정, 삭제
    export const PutGroup = async (groupId, payload) => {
        try {
            const response = await UserAxios.put(`/groups/${groupId}`, payload);   
            return response.status; // 응답 상태 코드 반환
        } catch (error) {
            console.error("그룹 수정 요청 실패", error);
            return error.response?.status || 500; // 오류 발생 시 상태 코드 반환 (500 기본값)
        }
    }
    
    export const DeleteGroup = async (groupId) => {
        try {
            const response = await UserAxios.delete(`/groups/${groupId}`);
            return response.status; // 응답 상태 코드 반환
        } catch (error) {
            console.error("그룹 삭제 요청 실패", error);
            return error.response?.status || 500; // 오류 발생 시 상태 코드 반환 (500 기본값)
        }
    }
    
