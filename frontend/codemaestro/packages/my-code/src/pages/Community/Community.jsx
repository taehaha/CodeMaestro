// Community.js
import React, { useContext, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PostsContext } from "../../context/PostsContext";
import { CommentsContext } from "../../context/CommentsContext";
import { getBoardList } from "../../api/BoardApi";
import { getCommentsByBoardId } from "../../api/CommentApi";
import "./Community.css";

const Community = () => {
  const navigate = useNavigate();
  const { posts, setPosts } = useContext(PostsContext);
  const [searchTerm, setSearchTerm] = useState("");
  const [commentCounts, setCommentCounts] = useState({});
  const [loading, setLoading] = useState(true);

  // 날짜 형식
  const formatDate = (isoString) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // 0부터 시작하므로 +1 필요
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  };  

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const data = await getBoardList();
        const sortedPosts = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setPosts(sortedPosts || []);

        const commentCountMap = {};
        await Promise.all(
          data.map(async (post) => {
            const comments = await getCommentsByBoardId(post.boardId);
            commentCountMap[post.boardId] = comments.length; // 댓글 개수 저장
          })
        );
        setCommentCounts(commentCountMap);
      } catch (error) {
        console.error("게시글 목록 불러오기 실패:", error);
      } finally {
        setLoading(false); // 로딩 종료
      }
    };

    fetchPosts();
  }, [setPosts]);

  // 검색어가 포함된 게시글 필터링
  const filteredPosts = posts.filter((post) =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 최신 게시글이 위에 오도록 filteredPosts를 날짜 기준 내림차순 정렬 (가정: created_at이 ISO 형식 문자열)
  const sortedPosts = [...filteredPosts].sort((a, b) => {
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  

  return (
    <div className="community-container">
      <h1 className="community-title">커뮤니티</h1>
      <p className="community-subtitle">다양한 사람을 만나고 생각의 폭을 넓혀보세요.</p>

      <div className="community-header">
        <button className="create-post-btn" onClick={() => navigate("/boards/create")}>
          ✏️ 작성하기
        </button>
        <div className="search-bar">
          <input
            type="text"
            placeholder="🔍︎  커뮤니티 내에서 검색"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <p className="loading-message">게시글을 불러오는 중...</p>
      ) : (
      <ul className="post-list">
        {filteredPosts.length > 0 ? (
          filteredPosts.map((post) => {
            // const commentCount = comments.filter((c) => c.board_id === post.boardId).length;
            return (
              <li key={post.boardId} className="post-item">
                <Link to={`/boards/${post.boardId}`} className="post-title">{post.title}</Link>
                <div className="post-meta">
                  <span className="post-author">{post.writerNickname}</span> | 
                  <span className="post-time">{formatDate(post.createdAt)}</span>
                </div>
                <div className="post-comments">💬 {commentCounts[post.boardId] !== undefined ? commentCounts[post.boardId] : 0}개</div>
              </li>
            );
          })
        ) : (
          <p className="no-results">검색 결과가 없습니다.</p>
        )}
      </ul>
      )}
    </div>
  );
};

export default Community;
