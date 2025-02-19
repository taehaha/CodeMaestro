import React, { createContext, useState, useEffect } from "react";
import { createBoard, deleteBoard, updateBoard } from "../api/BoardApi";

// Context 생성
export const PostsContext = createContext();

const PostsProvider = ({ children }) => {
  const [posts, setPosts] = useState([]);

  // 날짜 형식
  const formDate = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}-${hours}:${minutes}`;
  }

  // 게시글 생성
  const addPost = async (title, content, user_id, author) => {
    // const newPost = {
    //   id: posts.length + 1,
    //   title,
    //   content,
    //   user_id,
    //   author,
    //   created_at: formDate(),
    // };
    const newPost = { title, content, user_id, author };
    const data = await createBoard(newPost);
    if (data) {
      setPosts((prevPosts) => [...prevPosts, data]);
    }
  };

  // 게시글 삭제 (본인만 가능)
  const deletePost = async (postId, userId) => {
    const result = await deleteBoard(postId);
    if (result === 200) {
      setPosts((prevPosts) =>
        prevPosts.filter((post) =>
          post.id !== postId || post.user_id !== userId))
    } else {
      alert("게시글 삭제에 실패했습니다.")
    }
  };

  // 게시글 수정 (본인만 가능)
  const updatePost = (postId, userId, newTitle, newContent) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.boardId === postId && post.writerId === userId
          ? { ...post, title: newTitle, content: newContent }
          : post
      )
    );
  };

  return (
    <PostsContext.Provider value={{ posts, setPosts, updatePost }}>
      {children}
    </PostsContext.Provider>
  );
};

export default PostsProvider;
