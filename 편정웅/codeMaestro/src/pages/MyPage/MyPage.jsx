import MyPageHeader from './MyPageHeader';
import EditProfile from './EditProfile';
import EditBackgroundImage from './EditBackgroundImage';
import { useState } from 'react';
import ReactDOM from 'react-dom';
import { useSelector } from 'react-redux';
import UserList from '../../components/UserList';
import ManageFriend from '../Friend/ManageFriend';
import AddFriends from '../Friend/AddFriends';
const MyPage = () => {
    // 화면 구성 단계에서 여기 두고, 목표는 redux 전역 스토어로 옮기기 (실제 연결 시엔 axios만 짜면 바로 연결 가능하도록)
    const user = useSelector((state) => state.user.myInfo); 
    
    const [isEditModalOpen, setisEditModalOpen] = useState(false)
    const [isBackgroundEditModalOpen, setisBackgroundEditModalOpen] = useState(false)
    const [isAddFriendModalOpen, setisAddFriendModalOpen] = useState(false)
    const [checkedUsers, setCheckedUsers] = useState([]); // checkedList 상태 관리

    const openAddFriendPage = () => {
      setisAddFriendModalOpen(true)
    }


    const openEditPage = () => {
      setisEditModalOpen(true)
    }

    const openBackgroundEdit = () => {
      console.log(123);
      setisBackgroundEditModalOpen(true)
      
    }
    const closeBackgroundEdit = () => {
      setisBackgroundEditModalOpen(false)
    }
    const closeEditPage = () => {
      setisEditModalOpen(false)
    }

    const closeAddFriendPage = () => {
      setisAddFriendModalOpen(false)
    }
    

    if (!user) {
      console.log("User data is null, showing loading...");
      return <div className=' text-primaryText dark:text-darkText'>로그아웃 함수 확인용</div>;
    }

    return (
      <div>
        <MyPageHeader user={user} openEditPage={openEditPage} openBackgroundEdit={openBackgroundEdit} />
        <p className="header-style-border">My Friends</p>
        <div className="flex flex-col md:flex-row">
          {/* UserList 영역 */}
          <div className="w-full md:w-4/5">
            <UserList
             checkedUsers={checkedUsers} setCheckedUsers={setCheckedUsers}
            />
          </div>

          {/* ManageFriend 영역 */}
          <div className="w-full md:w-1/5 mt-4 md:mt-0 md:ml-4">
            <ManageFriend
             openAddFriendPage={openAddFriendPage}
             checkedUsers={checkedUsers}
            />
          </div>
        </div>
        {isEditModalOpen &&
          // 모달 페이지가 오픈되면, createportal을 통해 컴포넌트 위치와 상관 없이 모달을 띄움.
          ReactDOM.createPortal(
            // 모달 설정, 정중앙, z-인덱스 50
            <div 
            onClick={(e) => e.stopPropagation()} 
            className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50"> 
                {/* 모달 헤더 */}
                {/* EditProfile 컴포넌트 */}
                <EditProfile onClose={closeEditPage} />
              </div>,
            document.body // 모달을 body에 렌더링
          )}

          {isBackgroundEditModalOpen &&
          // 모달 페이지가 오픈되면, createportal을 통해 컴포넌트 위치와 상관 없이 모달을 띄움.
          ReactDOM.createPortal(
            // 모달 설정, 정중앙, z-인덱스 50
                <EditBackgroundImage onClose={closeBackgroundEdit} />,
            document.body // 모달을 body에 렌더링
          )}

        {isAddFriendModalOpen &&
          // 모달 페이지가 오픈되면, createportal을 통해 컴포넌트 위치와 상관 없이 모달을 띄움.
          ReactDOM.createPortal(
            // 모달 설정, 정중앙, z-인덱스 50
                <AddFriends onClose={closeAddFriendPage} />,
            document.body // 모달을 body에 렌더링
          )}  
      </div>
    );
}

export default MyPage;