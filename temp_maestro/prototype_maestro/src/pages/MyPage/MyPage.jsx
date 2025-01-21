import MyPageHeader from './MyPageHeader';
import EditProfile from './EditProfile';
import EditBackgroundImage from './EditBackgroundImage';
import { useState } from 'react';
import ReactDOM from 'react-dom';

import MyPageBody from './MyPageBody';
import { useSelector } from 'react-redux';
const MyPage = () => {
    // 화면 구성 단계에서 여기 두고, 목표는 redux 전역 스토어로 옮기기 (실제 연결 시엔 axios만 짜면 바로 연결 가능하도록)
    const user = useSelector((state) => state.user.myInfo); 
    
    const [isEditModalOpen, setisEditModalOpen] = useState(false)
    const [isBackgroundEditModalOpen, setisBackgroundEditModalOpen] = useState(false)

    const openEditPage = () => {
      setisEditModalOpen(true)
      console.log(isEditModalOpen);
      
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

    if (!user) {
      console.log("User data is null, showing loading...");
      return <div className=' text-primaryText dark:text-darkText'>로그아웃 함수 확인용</div>;
    }

    return (
      <div>
        <MyPageHeader user={user} openEditPage={openEditPage} openBackgroundEdit={openBackgroundEdit} />
        <MyPageBody />

        {isEditModalOpen &&
          // 모달 페이지가 오픈되면, createportal을 통해 컴포넌트 위치와 상관 없이 모달을 띄움.
          ReactDOM.createPortal(
            // 모달 설정, 정중앙, z-인덱스 50
            <div 
            onClick={(e) => e.stopPropagation()} 
            className="fixed inset-0 flex items-center justify-center z-50 bg-opacity-50"> 
              <div className="bg-primaryBoxcolor dark:bg-darkBoxColor dark:text-darkText rounded-sm shadow-lg w-full max-w-md p-6 ">
                {/* 모달 헤더 */}
                <div className="flex justify-between items-center border-b pb-2 mb-4">
                  <h2 className="text-lg font-semibold">프로필 수정</h2>
                  <button
                    onClick={closeEditPage} // 닫기 버튼
                    className="text-white hover:text-gray-800 text-2xl"
                  >
                    &times;
                  </button>
                </div>

                {/* EditProfile 컴포넌트 */}
                <EditProfile onClose={closeEditPage} />
              </div>
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
      </div>
    );
}

export default MyPage;