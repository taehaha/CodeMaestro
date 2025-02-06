import React, { createContext, useState } from "react";

// Context 생성
export const CommentsContext = createContext();

const CommentsProvider = ({ children }) => {
  const [comments, setComments] = useState([
    { id: 1, content: "좋은 정보 감사합니다!", user_id: 101, board_id: 1, created_at: "2024-02-06 11:00" },
    { id: 2, content: "저도 비슷한 경험이 있어요.", user_id: 102, board_id: 1, created_at: "2024-02-06 11:15" },
    { id: 3, content: "삼성TV 문제 심각하네요.", user_id: 103, board_id: 3, created_at: "2024-02-06 09:50" },
  ]);

  // 댓글 추가 함수
  const addComment = (board_id, user_id, content) => {
    const newComment = {
      id: comments.length + 1,
      content,
      user_id,
      board_id,
      created_at: new Date().toLocaleString("ko-KR", { hour12: false }),
    };
    setComments((prevComments) => [...prevComments, newComment]);
  };

  // 댓글 삭제 함수 (본인 댓글만 삭제 가능)
  const deleteComment = (commentId, userId) => {
    setComments((prevComments) =>
      prevComments.filter((comment) =>
        comment.id !== commentId || comment.user_id !== userId
      )
    );
  };

  // 댓글 수정 함수 (본인 댓글만 수정 가능)
  const updateComment = (commentId, userId, newContent) => {
    setComments((prevComments) =>
      prevComments.map((comment) =>
        comment.id === commentId && comment.user_id === userId
          ? { ...comment, content: newContent }
          : comment
      )
    );
  };

  return (
    <CommentsContext.Provider value={{ comments, addComment, deleteComment, updateComment }}>
      {children}
    </CommentsContext.Provider>
  );
};

export default CommentsProvider;
