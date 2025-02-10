import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PostsContext } from "../../context/PostsContext";
import "./PostCreate.css";
import { createBoard } from "../../api/BoardApi";
import { useSelector } from "react-redux";



const PostCreate = () => {
  const user = useSelector((state) => state.user.myInfo);
  const CURRENT_USER_ID = user.userId; // 현재 로그인한 사용자 ID
  const CURRENT_USER_NICKNAME = user.userNickname; // 현재 로그인한 사용자 NICKNAME
  const navigate = useNavigate();
  const { addPost } = useContext(PostsContext);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  
  const handleCreatePost = async () => {
    if (!title.trim() || !content.trim()) {
      alert("제목과 내용을 입력하세요.");
      return;
    }

    const payload = {
      title,
      content,
      userId: CURRENT_USER_ID, // 🔥 userId → user_id (백엔드 요구사항 확인 필요)
    };
  
    console.log("📌 게시글 생성 요청 데이터:", payload); // ✅ JSON인지 확인
  
    const newPost = await createBoard({ title, content, userId: CURRENT_USER_ID});
    
    if (newPost && !newPost.error) {

      // createBoard({title:newPost.title, content:newPost.content, userId:CURRENT_USER_ID});
      navigate("/boards");
    } 
    else {
      alert(newPost.error || "게시글 등록에 실패했습니다.")
    }
    // navigate("/boards");
  };

  return (
    <div className="post-create-container">
      <h1 className="post-create-title">게시글 작성</h1>
      <div className="post-box"> {/* post-box 추가 */}
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
    </div>
  );
};

export default PostCreate;
