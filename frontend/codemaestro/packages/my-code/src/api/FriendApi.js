import UserAxios from "./userAxios"

// 친구 목록 불러오기 (GET)
export const getFriendsInfo = async (userId) => {
    try {
      const response = await UserAxios.get(`/friends/users/${userId}/friends`);
      return response.data; // 프사, 닉네임, 상태, 온오프라인 여부 포함
    } catch (error) {
      console.error("Error fetching friends info:", error);
      throw error;
    }
  };
  
  // 전체 유저 목록 불러오기 (GET)
  export const searchUserInfo = async (search) => {

    try {

      const response = await UserAxios.get("/users/search", {
        params: { nickname: search }, // 검색어를 쿼리 파라미터로 전달
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching user info:", error);
      throw error;
    }
  };
  
  // 친구 추가 요청 (POST)
  export const FriendRequest = async (payload) => {
    try {
      const response = await UserAxios.post(`/friends/requests`, payload);
      return response.data;
    } catch (error) {
      console.error("Error adding friend:", error);
      throw error;
    }
  };
  
  // 받은 친구 추가 요청 불러오기 (GET)
  export const getRequests = async (userId) => {
    try {
      const response = await UserAxios.get(`friend-requests/${userId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetch friend:", error);
      throw error;
    }
  };
  
  // 친구 삭제 (DELETE)
  export const deleteFriend = async (requestId) => {
    try {
      const response = await UserAxios.delete(`/friends/requests/${requestId}/delete`);
      return response.data;
    } catch (error) {
      console.error("Error deleting friend:", error);
      throw error;
    }
  };
  

  // 친구 추가 요청 응답 (POST)
  export const AcceptFriendsRequest = async (requestId) => {
    try {
      const response = await UserAxios.post(`/friends/requests/${requestId}/accept`, { requestId });
      return response.data;
    } catch (error) {
      console.error("Error responding to friend request:", error);
      throw error;
    }
  };

  export const RejectFriendsRequest = async (requestId) => {
    try {
      const response = await UserAxios.post(`/friends/requests/${requestId}/reject`, { requestId });
      return response.data;
    } catch (error) {
      console.error("Error responding to friend request:", error);
      throw error;
    }
  };

  export const getFriendRequest = async (userId) => {
    try {
      const result = await UserAxios.get(`/friends/requests/${userId}/pending`);
      return result.data;
    } catch (error) {
      console.error("요청 목록 가져오는 중 오류 발생", error);
      // 에러 발생 시 빈 배열 반환 (notifications가 배열이라고 가정)
      return [];
    }
  };