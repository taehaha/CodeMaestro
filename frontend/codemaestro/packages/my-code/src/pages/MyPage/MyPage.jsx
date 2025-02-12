import React, { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import MyProfile from "./MyProfile";
import FriendsList from "./FriendsList";
import MyGroupList from "./MyGroupList";
import RecordingsList from "./RecordingsList";
import { useSelector } from "react-redux";
import "./MyPage.css";

const MyPage = () => {
  const [selectedTab, setSelectedTab] = useState((location.state && location.state.tab) || "profile");
  const [profileTab, setProfileTab] = useState("editProfile");
  const user = useSelector((state) => state.user.myInfo);
  
  useEffect(() => {
    if (location.state && location.state.tab) {
      setSelectedTab(location.state.tab);
    }
  }, [location.state]);

  const renderContent = () => {
    switch (selectedTab) {
      case "profile":
        return <MyProfile />;
      case "friends":
        return <FriendsList user={user}/>;
      case "groups":
        return <MyGroupList />;
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
