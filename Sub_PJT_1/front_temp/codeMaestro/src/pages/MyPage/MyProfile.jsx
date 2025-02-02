import MyProfileHeader from './MyProfileHeader';
import EditProfile from './EditProfile';
import EditBackgroundImage from './EditBackgroundImage';
import { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useSelector } from 'react-redux';
import UserList from '../../components/UserList';
import ManageFriend from '../Friend/ManageFriend';
import AddFriends from '../Friend/AddFriends';
import LoadAnimation from '../../components/LoadAnimation'; // 로딩 애니메이션 추가

const MyProfile = () => {
  // Redux에서 사용자 정보 가져오기
  // const user = useSelector((state) => state.user.myInfo);
  const user ={
        id: 'kopybara8421',
        name: '익명의 카피바라 8421',
        email: 'test@test.com',
        description: '오늘도 열심히 코딩합시다',
        tier: 27,
        // profile_image_url,
    }
  // 로딩 상태 추가
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Redux에서 user 정보가 있을 때 로딩 종료
    if (user) {
      setIsLoading(false);
    }
  }, [user]); 

  // 모달 상태
  const [isEditModalOpen, setisEditModalOpen] = useState(false);
  const [isBackgroundEditModalOpen, setisBackgroundEditModalOpen] = useState(false);
  const [isAddFriendModalOpen, setisAddFriendModalOpen] = useState(false);

  // UserList 체크 상태 관리
  const [checkedUsers, setCheckedUsers] = useState([]);

  // 상단 탭 상태
  const [activeTab, setActiveTab] = useState('profile');

  // 모달 열기 함수
  const openAddFriendPage = () => {
    setisAddFriendModalOpen(true);
  };

  const openEditPage = () => {
    setisEditModalOpen(true);
  };

  const openBackgroundEdit = () => {
    setisBackgroundEditModalOpen(true);
  };

  // 모달 닫기 함수
  const closeBackgroundEdit = () => {
    setisBackgroundEditModalOpen(false);
  };

  const closeEditPage = () => {
    setisEditModalOpen(false);
  };

  const closeAddFriendPage = () => {
    setisAddFriendModalOpen(false);
  };

  // **로딩 중일 때 로딩 애니메이션 표시**
  if (isLoading) {
    return <LoadAnimation />;
  }

  return (
    <div>
      {/* 헤더 */}
      <MyProfileHeader
        user={user}
        openEditPage={openEditPage}
        openBackgroundEdit={openBackgroundEdit}
      />

      {/* 상단 탭 영역 */}
      <div className="tabs border-b border-gray-300 pt-2">
        <button
          className={`tab tab-bordered hover:border-blue-500 hover:text-blue-500 transition-all duration-200 ${
            activeTab === 'profile' ? 'tab-active border-b-2 border-blue-500 text-blue-500' : ''
          }`}
          onClick={() => setActiveTab('profile')}
        >
          Profile
        </button>
        <button
          className={`tab tab-bordered hover:border-blue-500 hover:text-blue-500 transition-all duration-200 ${
            activeTab === 'friends' ? 'tab-active border-b-2 border-blue-500 text-blue-500' : ''
          }`}
          onClick={() => setActiveTab('friends')}
        >
          Friends
        </button>
        <button
          className={`tab tab-bordered hover:border-blue-500 hover:text-blue-500 transition-all duration-200 ${
            activeTab === 'settings' ? 'tab-active border-b-2 border-blue-500 text-blue-500' : ''
          }`}
          onClick={() => setActiveTab('settings')}
        >
          Settings
        </button>
      </div>

      {/* My Friends 섹션 */}
      <p className="header-style-border">My Friends</p>
      <div className="flex flex-col md:flex-row">
        {/* UserList 영역 */}
        <div className="w-full md:w-4/5">
          <UserList checkedUsers={checkedUsers} setCheckedUsers={setCheckedUsers} />
        </div>

        {/* ManageFriend 영역 */}
        <div className="w-full md:w-1/5 mt-4 md:mt-0 md:ml-4">
          <ManageFriend openAddFriendPage={openAddFriendPage} checkedUsers={checkedUsers} />
        </div>
      </div>

      {/* 모달: EditProfile */}
      {isEditModalOpen &&
        ReactDOM.createPortal(
          <div
            onClick={(e) => e.stopPropagation()}
            className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50"
          >
            <EditProfile onClose={closeEditPage} />
          </div>,
          document.body
        )}

      {/* 모달: EditBackgroundImage */}
      {isBackgroundEditModalOpen &&
        ReactDOM.createPortal(
          <EditBackgroundImage onClose={closeBackgroundEdit} />,
          document.body
        )}

      {/* 모달: AddFriends */}
      {isAddFriendModalOpen &&
        ReactDOM.createPortal(
          <AddFriends onClose={closeAddFriendPage} />,
          document.body
        )}
    </div>
  );
};

export default MyProfile;
