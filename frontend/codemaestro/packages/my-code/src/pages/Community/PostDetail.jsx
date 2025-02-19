import React, { useContext, useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { PostsContext } from "../../context/PostsContext";
import { getBoardDetail, updateBoard, deleteBoard } from "../../api/BoardApi";
import Comments from "../../components/Comments";
import "./PostDetail.css";

// 게시판 마크다운 문법적용 테스트
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github.css"; 
import "github-markdown-css";


const PostDetail = () => {
  const user = useSelector((state) => state.user.myInfo);
  const CURRENT_USER_ID = user.userId || null; // 현재 로그인한 사용자 ID
  const { boardId } = useParams(); // ✅ 중복 제거

  const navigate = useNavigate();
  const location = useLocation();
  const { deletePost, updatePost } = useContext(PostsContext);
  const [post, setPost] = useState(null);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [editing, setEditing] = useState(false);

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

  useEffect(() => {
    window.scrollTo(0, 0);

    if (!boardId) {
      console.error("🚨 boardId가 없습니다! 요청 중단");
      return;
    }



    const fetchPost = async () => {
      const validBoardId = Number(boardId);
      const fetchedPost = await getBoardDetail(validBoardId);

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
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <span>게시글을 불러오는 중...</span>
      </div>
    );
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
          <div className="edit-container">
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
            <div className="post-edit-actions">
              <button className="post-save-btn" onClick={handleSaveEdit}>
                저장
              </button>
              <button className="post-cancel-btn" onClick={() => setEditing(false)}>
                취소
              </button>
            </div>
          </div>
        ) : (
          <>
            <h1 className="post-title2">{post.title}</h1>
            <div className="post-header">
              <span className="post-author">{post.writerNickname}</span>
              <span className="post-time2">| {formatDate(post.createdAt)}</span>
            </div>
              <ReactMarkdown
                className="post-content markdown-body"
                rehypePlugins={[rehypeHighlight]}>
                {post.content}
              </ReactMarkdown>

          </>
        )}
      {isAuthor && (
        <div className="post-actions2">
          {!editing && (
            <button className="post-edit-btn" onClick={handleEdit}>
              수정
            </button>
          )}
          {!editing && (
            <button className="post-delete-btn" onClick={handleDelete}>
            삭제
            </button>
          )}
        </div>
      )}
      </div>

      {!editing && <Comments board_id={post.boardId} />}


      <button 
      className="list-button" 
      onClick={() => navigate("/boards", { state: { page: location.state?.page || 0 } })}>
        목록
      </button>
    </div>
  );
};

export default PostDetail;
