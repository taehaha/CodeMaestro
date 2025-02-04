import UserAxios from "./userAxios"

// 친구 목록 불러오기 (GET)
export const getFriendsInfo = async (userId) => {
    try {
      const response = await UserAxios.get(`friend-requests/friends/${userId}`);
      return response.data; // 프사, 닉네임, 상태, 온오프라인 여부 포함
    } catch (error) {
      console.error("Error fetching friends info:", error);
      throw error;
    }
  };
  
  // 전체 유저 목록 불러오기 (GET)
  export const getUserInfo = async (search) => {
    try {
      const response = await UserAxios.get("friend-requests/profile", {
        params: { search }, // 검색어를 쿼리 파라미터로 전달
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching user info:", error);
      throw error;
    }
  };
  
  // 친구 추가 요청 (POST)
  export const FriendRequest = async (userId) => {
    try {
      const response = await UserAxios.post(`friend-requests/${userId}`, { userId });
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
  export const deleteFriend = async (userId) => {
    try {
      const response = await UserAxios.delete(`friend-requests/${userId}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting friend:", error);
      throw error;
    }
  };
  

  // 친구 추가 요청 응답 (POST)
  export const friendAccept = async (requestId) => {
    try {
      const response = await UserAxios.post(`friend-requests/${requestId}/accept`, { requestId });
      return response.data;
    } catch (error) {
      console.error("Error responding to friend request:", error);
      throw error;
    }
  };

  export const friendReject = async (requestId) => {
    try {
      const response = await UserAxios.post(`friend-requests/${requestId}/reject`, { requestId });
      return response.data;
    } catch (error) {
      console.error("Error responding to friend request:", error);
      throw error;
    }
  };