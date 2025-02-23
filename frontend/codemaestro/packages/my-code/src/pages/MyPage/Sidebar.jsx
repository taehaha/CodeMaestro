import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import PropTypes from "prop-types";
import EditProfile from "./EditProfile";
import EditPassword from "./EditPassword";
import FriendsList from "./FriendsList";
import MyGroupList from "./MyGroupList"
import RecordingsList from "./RecordingsList";
import "./Sidebar.css";

const Sidebar = ({ onSelect, user }) => {
  const [searchParams] = useSearchParams();
  const defaulTab = searchParams.get("tab") || "profile";
  const [selectedTab, setSelectedTab] = useState(defaulTab);
  const [activeTab, setActiveTab] = useState("");

  const handleTabClick = (tab) => {
    setSelectedTab(tab);
    onSelect(tab);

    if (tab === "profile") {
      // 🔥 프로필을 처음 클릭한 경우만 기본값 설정
      setActiveTab((prev) => (selectedTab !== "profile" ? "" : prev));
    } else {
      setActiveTab(""); // 다른 탭을 클릭하면 프로필 탭 초기화
    }
  };

  return (
    <div className="sidebar-container">
      <div className="sidebar-menu">
        <button
          className={`sidebar-item ${selectedTab === "profile" ? "active" : ""}`} 
          onClick={() => handleTabClick("profile")}
        >
          프로필
        </button>
        <button 
          className={`sidebar-item ${selectedTab === "friends" ? "active" : ""}`} 
          onClick={() => handleTabClick("friends")}
        >
          친구 목록
        </button>
        <button 
          className={`sidebar-item ${selectedTab === "groups" ? "active" : ""}`} 
          onClick={() => handleTabClick("groups")}
        >
          그룹 목록
        </button>
      </div>

      {/* 🔥 선택된 탭에 따라 콘텐츠 표시 */}
      <div className="tab-content">
        {selectedTab === "profile" && (
          <>
            <div className="tab-buttons">
              <button 
                onClick={() => setActiveTab("profile")} 
                className={`tab-button ${activeTab === "profile" ? "active" : ""}`}
              >
                프로필 수정
              </button>
              {(!user.loginProvider || user.loginProvider === "LOCAL") && (

                <button 
                onClick={() => setActiveTab("password")} 
                className={`tab-button ${activeTab === "password" ? "active" : ""}`}
                >
                비밀번호 변경
              </button>
              )}
            </div>

            {activeTab === "profile" && <EditProfile user={user} />}
            {activeTab === "password" && <EditPassword />}
          </>
        )}
        {selectedTab === "friends" && <FriendsList />}
        {selectedTab === "groups" && <MyGroupList />}
        {selectedTab === "recordings" && <RecordingsList />}
      </div>
    </div>
  );
};

Sidebar.propTypes = {
  onSelect: PropTypes.func.isRequired,
  user: PropTypes.object.isRequired, // user 데이터를 필수 prop으로 요구
};

export default Sidebar;
