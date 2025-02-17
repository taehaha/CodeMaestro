import UserAxios from "./userAxios"

// 게시글 전체 조회
export const getBoardList = async () => {
  try {
    const response = await UserAxios.get("/boards");
    return response.data;
  } catch (error) {
    console.log("게시글 목록 불러오기 실패", error);
    return [];
  }
}

// 게시글 상세 조회
export const getBoardDetail = async (boardId) => {
  try {
    const response = await UserAxios.get(`/boards/${boardId}`);
    return response.data;
  } catch (error) {
    console.error(`게시글 ${boardId} 상세 조회 실패`, error);
    return null;
  }
};

// 게시글 생성
export const createBoard = async (payload) => {
  try {
    const response = await UserAxios.post("/boards", payload, {
      headers: {"Content-Type": "application/json"}
    });
    return response.data;
  } catch (error) {
    console.log("게시글 작성 실패", error);
    return {error: error.response?.data?.message || "게시글 생성 중 오류 발생"};
  }
};

// 게시글 수정
export const updateBoard = async (boardId, payload) => {
  try {
    const response = await UserAxios.put(`/boards/${boardId}`, payload);
    return response.status;
  } catch (error) {
    console.error(`게시글 ${boardId} 수정 실패`, error);
    return error.response?.status || 500;
  }
};

// 게시글 삭제
export const deleteBoard = async (boardId) => {
  try {
    const response = await UserAxios.delete(`/boards/${boardId}`);
    return response.status;
  } catch (error) {
    console.error(`게시글 ${boardId} 삭제 실패`, error);
    return error.response?.status || 500;
  }
}