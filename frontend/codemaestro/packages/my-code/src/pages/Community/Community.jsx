// Community.js
import React, { useContext, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import ReactPaginate from "react-paginate";
import { PostsContext } from "../../context/PostsContext";
import { getBoardList } from "../../api/BoardApi";
import { getCommentsByBoardId } from "../../api/CommentApi";
import LoadAnimation from "../../components/LoadAnimation";
import "./Community.css";

const Community = () => {
  const navigate = useNavigate();
  const { posts, setPosts } = useContext(PostsContext);
  
  // 검색어
  const [searchTerm, setSearchTerm] = useState("");
  // 댓글 개수
  const [commentCounts, setCommentCounts] = useState({});
  // 로딩 상태
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const data = await getBoardList();
        // 최신순 정렬
        const sortedPosts = data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setPosts(sortedPosts || []);

        // 댓글 수 불러오기
        const commentCountMap = {};
        await Promise.all(
          data.map(async (post) => {
            const comments = await getCommentsByBoardId(post.boardId);
            commentCountMap[post.boardId] = comments.length;
          })
        );
        setCommentCounts(commentCountMap);
      } catch (error) {
        console.error("게시글 목록 불러오기 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [setPosts]);

  // 검색 필터
  const filteredPosts = posts.filter((post) =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 페이지네이션 관련
  const [currentPage, setCurrentPage] = useState(0);
  const articles = 4; // 한 페이지 당 게시글 수

  // 검색어가 바뀌면 페이지를 0으로 초기화 (첫 페이지로)
  useEffect(() => {
    setCurrentPage(0);
  }, [searchTerm]);

  // 페이지네이션 계산
  const start = currentPage * articles;
  // N페이지에 있어야 할 데이터들
  const currentPageData = filteredPosts.slice(start, start + articles);
  // 몇페이지 있냐 계산
  const pageCount = Math.ceil(filteredPosts.length / articles);

  const handlePageChange = (selectedItem) => {
    setCurrentPage(selectedItem.selected);
  };

  // 날짜 포맷
  const formatDate = (isoString) => {
    if (!isoString) return "";
    const date = new Date(isoString);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  };

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
        <>
          <LoadAnimation />
          <p className="loading-message">게시글을 불러오는 중...</p>
        </>
      ) : (
        <>
          <ul className="post-list">
            {filteredPosts.length > 0 ? (
              currentPageData.map((post) => (
                <li key={post.boardId} className="post-item">
                  <Link to={`/boards/${post.boardId}`} className="post-title">
                    {post.title}
                  </Link>
                  <div className="post-meta">
                    <span className="post-author">{post.writerNickname}</span> |{" "}
                    <span className="post-time">{formatDate(post.createdAt)}</span>
                  </div>
                  <div className="post-comments">
                    💬 {commentCounts[post.boardId] ?? 0}개
                  </div>
                </li>
              ))
            ) : (
              <p className="no-results">검색 결과가 없습니다.</p>
            )}
          </ul>

          {/* 페이지네이션 */}
          <ReactPaginate
            previousLabel={"이전"}
            nextLabel={"다음"}
            pageCount={pageCount}
            onPageChange={handlePageChange}
            containerClassName={"pagination"} // CSS 클래스
            activeClassName={"active"}        // 활성화된 페이지 CSS 클래스
          />
        </>
      )}
    </div>
  );
};

export default Community;
