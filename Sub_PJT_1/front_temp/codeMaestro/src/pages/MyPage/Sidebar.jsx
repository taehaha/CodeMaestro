import React from "react";
import "./Sidebar.css";

const Sidebar = () => {
  return (
    <div className="sidebar">
      <ul className="sidebar-menu">
        <li

        >회원정보 수정</li>
        <li>회의 녹화 리스트</li>
        <li>친구 목록</li>
        <li className="active">그룹 목록</li>
      </ul>
    </div>
  );
};

export default Sidebar;
