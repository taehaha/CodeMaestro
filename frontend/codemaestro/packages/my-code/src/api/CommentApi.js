import UserAxios from "./userAxios"; // UserAxios 사용

// 🔹 특정 게시글의 댓글 목록 가져오기
export const getCommentsByBoardId = async (boardId) => {
  try {
    const response = await UserAxios.get(`/comments/${boardId}`);
    return response.data;
  } catch (error) {
    console.error("🚨 댓글 불러오기 실패", error);
    return [];
  }
};

// 🔹 새 댓글 작성
export const addComment = async (boardId, userId, content) => {
  try {
    const response = await UserAxios.post("/comments", {
      boardId,
      userId,
      content,
    });
    return response.data;
  } catch (error) {
    console.error("🚨 댓글 작성 실패", error);
    return null;
  }
};

// 🔹 댓글 삭제
export const deleteComment = async (commentId) => {
  try {
    await UserAxios.delete(`/comments/${commentId}`);
    return true;
  } catch (error) {
    console.error("🚨 댓글 삭제 실패", error);
    return false;
  }
};
