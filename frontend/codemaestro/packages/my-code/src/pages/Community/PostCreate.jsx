import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PostsContext } from "../../context/PostsContext";
import "./PostCreate.css";

const CURRENT_USER_ID = 101; // ✅ 예제: 현재 로그인한 사용자 ID

const PostCreate = () => {
  const navigate = useNavigate();
  const { addPost } = useContext(PostsContext);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const handleCreatePost = () => {
    if (!title.trim() || !content.trim()) {
      alert("제목과 내용을 입력하세요.");
      return;
    }
    addPost(title, content, CURRENT_USER_ID, "현재 사용자");
    navigate("/boards");
  };

  return (
    <div className="post-create-container">
      <h1 className="post-create-title">게시글 작성</h1>
      <div className="post-form">
        <input
          className="post-title-input"
          type="text"
          placeholder="제목을 입력하세요."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          className="post-content-input"
          placeholder="내용을 입력하세요."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
      </div>
      <div className="post-actions">
        <button className="cancel-btn" onClick={() => navigate("/boards")}>취소</button>
        <button className="submit-btn" onClick={handleCreatePost}>등록</button>
      </div>
    </div>
  );
};

export default PostCreate;
