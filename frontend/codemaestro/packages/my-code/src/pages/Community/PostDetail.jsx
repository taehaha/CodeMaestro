import React, { useContext, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PostsContext } from "../../context/PostsContext";
import Comments from "../../components/Comments";
import "./PostDetail.css";

const CURRENT_USER_ID = 101; // ✅ 현재 로그인한 사용자 ID (실제 로그인 연동 필요)

const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { posts, deletePost, updatePost } = useContext(PostsContext);
  const post = posts.find((p) => p.id === Number(id));

  const [editing, setEditing] = useState(false);
  const [newTitle, setNewTitle] = useState(post?.title || "");
  const [newContent, setNewContent] = useState(post?.content || "");

  if (!post) {
    return <h2>해당 게시글을 찾을 수 없습니다.</h2>;
  }

  const handleDelete = () => {
    if (post.user_id === CURRENT_USER_ID) {
      deletePost(post.id, CURRENT_USER_ID);
      navigate("/boards");
    } else {
      alert("본인이 작성한 게시글만 삭제할 수 있습니다.");
    }
  };

  const handleEdit = () => {
    setEditing(true);
  };

  const handleSaveEdit = () => {
    if (!newTitle.trim() || !newContent.trim()) {
      alert("제목과 내용을 입력하세요.");
      return;
    }
    updatePost(post.id, CURRENT_USER_ID, newTitle, newContent);
    setEditing(false);
  };
  
  return (
    <div className="post-container">
      <div className="post-box">
        {editing ? (
          <>
            <input className="post-edit-title" type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
            <textarea className="post-edit-content" value={newContent} onChange={(e) => setNewContent(e.target.value)} />
            <button className="post-save-btn" onClick={handleSaveEdit}>저장</button>
          </>
        ) : (
          <>
            <h1 className="post-title2">{post.title}</h1>
            <p className="post-content">{post.content}</p>
          </>
        )}
        <div className="post-header">
          <span className="post-author">{post.author}</span>
          <span className="post-time">· {post.created_at}</span>
        </div>
      </div>

      <Comments board_id={post.id} />

      {post.user_id === CURRENT_USER_ID && (
        <div className="post-actions">
          {editing ? null : <button className="post-edit-btn" onClick={handleEdit}>수정</button>}
          <button className="post-delete-btn" onClick={handleDelete}>삭제</button>
        </div>
      )}

      <button className="list-button" onClick={() => navigate("/boards")}>목록</button>
    </div>
  );
};

export default PostDetail;