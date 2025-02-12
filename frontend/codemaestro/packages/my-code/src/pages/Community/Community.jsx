import React, { useContext, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PostsContext } from "../../context/PostsContext";
import { CommentsContext } from "../../context/CommentsContext";
import { getBoardList } from "../../api/BoardApi";
import "./Community.css";

const Community = () => {
  const navigate = useNavigate();
  const { posts, setPosts } = useContext(PostsContext);
  const { comments } = useContext(CommentsContext);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true); // 로딩 시작
      try {
        const data = await getBoardList();
        setPosts(data || []);
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

  return (
    <div className="community-container">
      <h1 className="community-title">커뮤니티</h1>
      <p className="community-subtitle">
        다양한 사람을 만나고 생각의 폭을 넓혀보세요.
      </p>

      <div className="community-header">
        <button className="create-post-btn" onClick={() => navigate("/boards/create")}>✏️ 작성하기</button>
        <div className="search-bar">
          <input
            type="text"
            placeholder="🔍 커뮤니티 내에서 검색"
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
            const commentCount = comments.filter((c) => c.board_id === post.id).length;
            return (
              <li key={post.id} className="post-item">
                <Link to={`/boards/${post.boardId}`} className="post-title">{post.title}</Link>
                <div className="post-meta">
                  <span className="post-author">{post.author}</span> | 
                  <span className="post-time">{post.created_at}</span>
                </div>
                <div className="post-comments">💬 {commentCount}개</div>
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
