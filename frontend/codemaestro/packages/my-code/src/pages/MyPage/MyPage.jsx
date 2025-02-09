import React, { useState } from "react";
import Sidebar from "./Sidebar";
import MyProfile from "./MyProfile";
import FriendsList from "./FriendsList";
import MyGroupList from "./MyGroupList";
import RecordingsList from "./RecordingsList";
import { useSelector } from "react-redux";
import "./MyPage.css";

const MyPage = () => {
  const [selectedTab, setSelectedTab] = useState("profile");
  const [profileTab, setProfileTab] = useState("editProfile");
  const user = useSelector((state) => state.user.myInfo);

  const renderContent = () => {
    switch (selectedTab) {
      case "profile":
        return <MyProfile />;
      case "friends":
        return <FriendsList user={user}/>;
      case "groups":
        return <MyGroupList />;
      case "recordings":
        return <RecordingsList />;
      default:
        return <MyProfile />;
    }
  };

  return (
    <div className="mypage-container">
      {/* <div className="tab-container"> */}
        {/* <Sidebar onSelect={setSelectedTab} /> */}
      {/* </div> */}
      <div className="content-area">
        {renderContent()}
      </div>
    </div>
  );
};

export default MyPage;
