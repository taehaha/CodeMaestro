import React from "react";
import Sidebar from "./Sidebar";
import GroupList from "./GroupList";
import "./MyPage.css";

const MyPage = () => {
  return (
    <div className="mypage-container">
      <Sidebar />
      <GroupList />
    </div>
  );
};

export default MyPage;
