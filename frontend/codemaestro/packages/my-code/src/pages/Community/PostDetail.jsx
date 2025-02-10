import React, { useContext, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { PostsContext } from "../../context/PostsContext";
import { getBoardDetail, updateBoard, deleteBoard } from "../../api/BoardApi";
import Comments from "../../components/Comments";
import "./PostDetail.css";


const PostDetail = () => {
  const user = useSelector((state) => state.user.myInfo);
  const CURRENT_USER_ID = user.userId || null; // 현재 로그인한 사용자 ID
  const { boardId } = useParams(); // ✅ 중복 제거
  console.log("📌 가져온 boardId:", boardId);

  const navigate = useNavigate();
  const { deletePost, updatePost } = useContext(PostsContext);
  const [post, setPost] = useState(null);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (!boardId) {
      console.error("🚨 boardId가 없습니다! 요청 중단");
      return;
    }

    const fetchPost = async () => {
      const validBoardId = Number(boardId);
      console.log("📌 getBoardDetail 호출 boardId:", validBoardId);

      const fetchedPost = await getBoardDetail(validBoardId);
      console.log("📌 게시글 상세 데이터:", fetchedPost);

      if (fetchedPost) {
        setPost(fetchedPost);
      }
    };

    fetchPost();
  }, [boardId]);

  useEffect(() => {
    if (post) {
      setNewTitle(post.title);
      setNewContent(post.content);
    }
  }, [post]);

  if (!post) {
    return <h2>게시글을 불러오는 중...</h2>;
  }

  const isAuthor = post.writerId === CURRENT_USER_ID && CURRENT_USER_ID !== null;
  const handleDelete = async () => {
    if (!isAuthor) {
      alert("본인이 작성한 게시글만 삭제할 수 있습니다.");
      return;
    }

    if (window.confirm("정말 삭제하시겠습니까?")) {
      const success = await deleteBoard(post.boardId);

      if (success) {
        alert("게시글이 삭제되었습니다.");
        navigate("/boards"); // ✅ 삭제 후 목록으로 이동
      } else {
        alert("게시글 삭제 실패!");
      }
    }
  };

  const handleEdit = () => {
    setEditing(true);
  };

  const handleSaveEdit = async () => {
    if (!newTitle.trim() || !newContent.trim()) {
      alert("제목과 내용을 입력하세요.");
      return;
    }
    try {
      const updatedPost = await updateBoard(post.boardId, {
        title: newTitle,
        content: newContent,
      });
  
      if (updatedPost) {
        setPost(updatedPost);
        setEditing(false);

        navigate("/boards")
      } else {
        alert("게시글 수정 실패!");
      }
    } catch (error) {
      console.error("게시글 수정 오류:", error);
      alert("게시글 수정 중 오류 발생!");
    }
  };

  return (
    <div className="post-container">
      <div className="post-box">
        {editing ? (
          <>
            <input
              className="post-edit-title"
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
            />
            <textarea
              className="post-edit-content"
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
            />
            <button className="post-save-btn" onClick={handleSaveEdit}>
              저장
            </button>
          </>
        ) : (
          <>
            <h1 className="post-title2">{post.title}</h1>
            <div className="post-header">
              <span className="post-author">{post.writerNickname}</span>
              <span className="post-time">| {post.createdAt}</span>
            </div>
            <p className="post-content">{post.content}</p>
          </>
        )}
      </div>

      {!editing && <Comments board_id={post.boardId} />}

      {isAuthor && (
        <div className="post-actions">
          {!editing && (
            <button className="post-edit-btn" onClick={handleEdit}>
              수정
            </button>
          )}
          <button className="post-delete-btn" onClick={handleDelete}>
            삭제
          </button>
        </div>
      )}

      <button className="list-button" onClick={() => navigate("/boards")}>
        목록
      </button>
    </div>
  );
};

export default PostDetail;
