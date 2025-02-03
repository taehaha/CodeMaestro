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
    