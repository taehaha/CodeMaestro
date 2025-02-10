import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import ReactDOM from 'react-dom';

import MyProfileHeader from './MyProfileHeader';
import EditProfile from './EditProfile';
import EditPassword from './EditPassword';
import EditBackgroundImage from './EditBackgroundImage';
import Sidebar from './Sidebar';
import './MyProfile.css';

const MyProfile = () => {
  // Redux에서 사용자 정보 가져오기
  const user = useSelector((state) => state.user.myInfo);

//   const user ={
//     id: 'kopybara8421',
//     name: '익명의 카피바라 8421',
//     email: 'test@test.com',
//     description: '오늘도 열심히 코딩합시다',
//     tier: 27,
//     // profile_image_url,
// }
  // console.log(user);
  
  // 모달 상태
  const [isBackgroundEditModalOpen, setisBackgroundEditModalOpen] = useState(false);

  // 상단 탭 상태
  const [activeTab, setActiveTab] = useState('');
  const [selectedTab, setSelectedTab] = useState("");

  // 모달 열기 함수
  const openBackgroundEdit = () => {
    setisBackgroundEditModalOpen(true);
  };
  
  // 모달 닫기 함수
  const closeBackgroundEdit = () => {
    setisBackgroundEditModalOpen(false);
  };


  return (
    <div>
      {/* 헤더 */}
      <MyProfileHeader
        user={user}
        openBackgroundEdit={openBackgroundEdit}
      />

       {/* 유저 정보와 사이드바를 개별적으로 배치 */}
      <div className="profile-container">
        {/* 유저 정보 */}
          <div className="user-info">
              <p className="text-lg font-bold">{user.nickname}</p>
              <div className="items-center mt-2 space-x-1">
              <p className="text-sm font-semibold">{user.email}</p>
            </div>
            <p className="text-sm mt-2">{user.description}</p>
          </div>

          {/* 탭 내용 렌더링 */}
          <div className="tab-content">
            {activeTab === 'profile' && <EditProfile user={user} onClose={() => {}} onDelete={() => console.log("사용자가 탈퇴했습니다.")}/>}
            {activeTab === 'password' && <EditPassword />}
          </div>

        {/* Sidebar를 개별적으로 관리하는 컨테이너 */}
        <div className="sidebar-container">
          <Sidebar onSelect={() => {}} user={user} selectedTab={selectedTab} setSelectedTab={setSelectedTab}/>
        </div>
      </div>

      {isBackgroundEditModalOpen &&
        ReactDOM.createPortal(
          <EditBackgroundImage onClose={closeBackgroundEdit} />,
          document.body
        )}
    </div>
  );
};

export default MyProfile;
