import React, { createContext, useState } from "react";

// Context 생성
export const PostsContext = createContext();

const PostsProvider = ({ children }) => {
  const [posts, setPosts] = useState([
    { id: 1, 
      title: "신입 개발자 채용 동향", 
      content: "채용 동향 공유합니다.", 
      user_id: 101, 
      author: "aabbccddeeff", 
      created_at: "2024-02-06 10:30" 
    },
    { id: 2, 
      title: "4년차 Java 개발자 어느정도 힘드나요?", 
      content: "개발 4년차인데 힘드네요.", 
      user_id: 102, 
      author: "CrownW", 
      created_at: "2024-02-05 18:15" 
    },
    { id: 3, 
      title: "삼성TV 예약작업 문제", 
      content: "삼성TV 예약 기능 문제 있음.", 
      user_id: 103, 
      author: "mmyang", 
      created_at: "2024-02-06 09:45" 
    },
  ]);

  // 게시글 추가
  const addPost = (title, content, user_id, author) => {
    const newPost = {
      id: posts.length + 1,
      title,
      content,
      user_id,
      author,
      created_at: new Date().toLocaleString("ko-KR", { hour12: false }),
    };
    setPosts((prevPosts) => [...prevPosts, newPost]);
  };

  // 게시글 삭제 (본인만 가능)
  const deletePost = (postId, userId) => {
    setPosts((prevPosts) =>
      prevPosts.filter((post) =>
        post.id !== postId || post.user_id !== userId
      )
    );
  };

  // 게시글 수정 (본인만 가능)
  const updatePost = (postId, userId, newTitle, newContent) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId && post.user_id === userId
          ? { ...post, title: newTitle, content: newContent }
          : post
      )
    );
  };

  return (
    <PostsContext.Provider value={{ posts, addPost, deletePost, updatePost }}>
      {children}
    </PostsContext.Provider>
  );
};

export default PostsProvider;
