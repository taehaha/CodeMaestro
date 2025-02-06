import React, { useContext, useState } from "react";
import { CommentsContext } from "../context/CommentsContext";
import "./Comments.css";

const CURRENT_USER_ID = 101; // ✅ 예제: 현재 로그인한 사용자 ID (실제 로그인 연동 필요)

const Comments = ({ board_id }) => {
  const { comments, addComment, deleteComment, updateComment } = useContext(CommentsContext);
  const [commentText, setCommentText] = useState("");
  const [editingComment, setEditingComment] = useState(null);
  const [editedText, setEditedText] = useState("");

  const filteredComments = comments.filter((comment) => comment.board_id === board_id);

  const handleAddComment = () => {
    if (!commentText.trim()) {
      alert("댓글을 입력하세요.");
      return;
    }
    addComment(board_id, CURRENT_USER_ID, commentText.trim());
    setCommentText("");
  };

  const handleDelete = (commentId) => {
    deleteComment(commentId, CURRENT_USER_ID);
  };

  const handleEdit = (comment) => {
    setEditingComment(comment.id);
    setEditedText(comment.content);
  };

  const handleSaveEdit = (commentId) => {
    if (!editedText.trim()) {
      alert("댓글 내용을 입력하세요.");
      return;
    }
    updateComment(commentId, CURRENT_USER_ID, editedText.trim());
    setEditingComment(null);
  };

  const handleKeyPress = (e, commentId) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (editingComment) {
        handleSaveEdit(commentId);
      } else {
        handleAddComment();
      }
    }
  };

  return (
    <div className="comment-box">
      <div className="comment-section-title">💬 댓글 {filteredComments.length}개</div>
      <ul className="comment-list">
        {filteredComments.map((comment) => (
          <li key={comment.id} className="comment-item">
            <span className="comment-author">User {comment.user_id}</span>
            <span className="comment-time">· {comment.created_at}</span>
            {editingComment === comment.id ? (
              <input
                className="comment-edit-input"
                type="text"
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
                onKeyDown={(e) => handleKeyPress(e, comment.id)}
              />
            ) : (
              <p className="comment-content">{comment.content}</p>
            )}

            {comment.user_id === CURRENT_USER_ID && (
              <div className="comment-actions">
                {editingComment === comment.id ? (
                  <button className="comment-save-btn" onClick={() => handleSaveEdit(comment.id)}>저장</button>
                ) : (
                  <>
                    <button className="comment-edit-btn" onClick={() => handleEdit(comment)}>수정</button>
                    <button className="comment-delete-btn" onClick={() => handleDelete(comment.id)}>삭제</button>
                  </>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>

      <div className="comment-input-container">
        <input
          className="comment-input"
          type="text"
          placeholder="댓글을 남겨보세요"
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
