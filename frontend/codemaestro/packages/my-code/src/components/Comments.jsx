import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { getCommentsByBoardId, addComment, deleteComment } from "../api/CommentApi"; // API 추가
import "./Comments.css";

const Comments = ({ board_id }) => {
  const user = useSelector((state) => state.user.myInfo);
  const CURRENT_USER_ID = user?.userId || null;
  const CURRENT_USER_NICKNAME = user?.userNickname || "익명"; // 닉네임 기본값 추가

  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");

  const formatDate = (isoString) => {
    if (!isoString) return "";
  
    const date = new Date(isoString);
  
    // 연, 월, 일 추출
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // 0부터 시작하므로 +1 필요
    const day = String(date.getDate()).padStart(2, "0");
  
    // 시간, 분 추출
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
  
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  };

  // 🔹 게시글의 댓글 목록 불러오기
  useEffect(() => {
    const fetchComments = async () => {
      if (!board_id) return;
      try {
        const data = await getCommentsByBoardId(board_id);
        console.log("서버에서 받은 댓글:", data);
        
        setComments(data);
      } catch (error) {
        console.error("🚨 댓글 불러오기 실패", error);
      }
    };
    fetchComments();
  }, [board_id]);

  // 🔹 댓글 추가 핸들러
  const handleAddComment = async () => {
    if (!commentText.trim()) {
      alert("댓글을 입력하세요.");
      return;
    }

    try {
      const newComment = await addComment(board_id, CURRENT_USER_ID, commentText.trim());
      console.log("📌 추가된 댓글 데이터:", newComment);
  
      if (newComment) {
        setCommentText(""); // ✅ 입력창 초기화
  
        // 🔥 최신 댓글 목록을 서버에서 다시 불러오기
        const updatedComments = await getCommentsByBoardId(board_id);
        setComments(updatedComments);
      } else {
        alert("댓글 작성에 실패했습니다.");
      }
    } catch (error) {
      console.error("🚨 댓글 추가 실패:", error);
      alert("댓글 추가 중 오류 발생!");
    }
  };

  // 🔹 댓글 삭제 핸들러
  const handleDelete = async (commentId) => {
    const success = await deleteComment(commentId);
    if (success) {
      setComments((prev) => prev.filter((comment) => comment.commentId !== commentId)); // ✅ 삭제된 댓글 제거
    } else {
      alert("댓글 삭제 실패!");
    }
  };

  return (
    <div className="comment-box">
      <div className="comment-section-title">💬 댓글 {comments.length}개</div>
      <ul className="comment-list">
        {comments.map((comment) => (
          <li key={comment.commentId} className="comment-item">
            <span className="comment-author">{comment.writerNickname}</span>
            <span className="comment-time">| {formatDate(comment.createdAt)}</span>
            <p className="comment-content">{comment.content}</p>

            {comment.writerId === CURRENT_USER_ID && (
              <div className="comment-actions">
                <button className="comment-delete-btn" onClick={() => handleDelete(comment.commentId)}>
                  삭제
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>

      {/* 🔹 댓글 입력창 */}
      <div className="comment-input-container">
        <input
          className="comment-input"
          type="text"
          placeholder="댓글을 남겨보세요."
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
        />
        <button className="comment-button" onClick={handleAddComment}>댓글 쓰기</button>
      </div>
    </div>
  );
};

export default Comments;
