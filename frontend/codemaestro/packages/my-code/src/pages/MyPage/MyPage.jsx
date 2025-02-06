import React, { useState } from "react";
import Sidebar from "./Sidebar";
import MyGroupList from "./MyGroupList";
import MyProfile from "./MyProfile";
import "./MyPage.css";

const MyPage = () => {
  const [activeTab, setActiveTab] = useState("profile"); // 기본값을 그룹 목록으로 설정

  return (
    <div className="mypage-container">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="w-full h-full">
        {activeTab === "profile" && <MyProfile />}
        {activeTab === "group" && <MyGroupList />}
      </div>
    </div>
  );
};

export default MyPage;
