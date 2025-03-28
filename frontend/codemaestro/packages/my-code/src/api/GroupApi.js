import { assign } from "lodash";
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
    
// 그룹 탈퇴
    export const LeaveGroup = async (payload) => {
        // console.log(payload);
        
        try {
            const response = await UserAxios.delete(`/groups/leave`, {
                data: payload});
            return response.status;

        } catch (error) {
            console.error("그룹 탈퇴 요청 실패", error);
            return error.response?.status || 500; // 오류 발생 시 상태 코드 반환 (500 기본값)
        }
    }

    // 그룹 수정, 삭제
    // 200 = 요청 처리, 400 = 요청 미존재
    export const PutGroup = async (groupId, payload) => {
        try {
            const response = await UserAxios.put(`/groups/transfer-owner`, payload);   
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
    

    // 그룹 가입 수락, 거절
    // 200 = 요청 처리, 400 = 요청 미존재
    export const AcceptGroupRequest = async (requestId) => {
        try {
            const response = await UserAxios.post(`/groups/requests/${requestId}/accept`);
            return response.status

        } catch (error) {
            console.error("수락 요청 실패", error);
            return error.response?.status || 500;
            
        }
    }

    export const RejectGroupRequest = async (requestId) => {
        try {
            const response = await UserAxios.post(`/groups/requests/${requestId}/reject`);
            return response.status

        } catch (error) {
            console.error("거절 요청 실패", error);
            return error.response?.status || 500;
            
        }
    }

    // 그룹 랭킹 조회
    export const GroupRankingList = async (payload) =>{
        try {
            const result = await UserAxios.get(`/groups/rankings`,
                {params:{year:payload.year,
                    month:payload.month,}}
            )

            return result.data
        } catch (error) {
            console.error("그룹 랭킹 호출 중 오류 발생", error);
        }
    }

    export const getGroupRequest = async (userId) => {
        try {
          const result = await UserAxios.get(`/groups/requests/${userId}/pending`);
          return result.data;
        } catch (error) {
          console.error("요청 목록 가져오는 중 오류 발생", error);
          // 에러 발생 시 빈 배열 반환 (notifications가 배열이라고 가정)
          return [];
        }
      };

    
    export const getGroupStric = async (groupId) => {
        try {
            const result = await UserAxios.get(`/groups/${groupId}/attendance`)
            return result.data
        } catch (error) {
            console.error("스트릭 가져오는 중 오류 발생", error);
            return [];
        }
    }


    export const createGroupConference = async (groupId, payload) => {
        try {
            // 1) FormData 객체 생성
            const formData = new FormData();
      // 2) FormData에 필드 추가
            // 문자열(또는 숫자)은 그대로 append
            formData.append("title", payload.title);
            formData.append("description", payload.description ?? "");
            if (payload.accessCode) {
                formData.append("accessCode", payload.accessCode);
            }

            
            // 배열, 객체 형태로 보내야 한다면 JSON.stringify를 사용하는 방법이 일반적임
            formData.append("tagNameList", payload.tagNameList);
            formData.append("groupId", groupId);

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

    export const isConference = async (groupId) => {
        const response = await UserAxios.get(`/groups/conference/check`, {params:{groupId:groupId}})
        return response
    }