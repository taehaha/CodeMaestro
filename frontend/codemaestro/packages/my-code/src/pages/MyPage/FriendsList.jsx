import React, { useEffect, useState } from "react";
import UserList from "../../components/UserList";
import ManageFriend from "../Friend/ManageFriend";
import AddFriends from "../Friend/AddFriends";
import { getFriendsInfo } from "../../api/FriendApi";
import LoadAnimation from "../../components/LoadAnimation";
import { PropTypes } from "prop-types";
import { useSelector } from "react-redux";

import "./FriendsList.css";

const FriendsList = () => {
  const [friends, setFriends] = useState([]);
  const [isLoading, setIsLoading] = useState(false); // 로딩 상태 추가
  const [isAddFriendModalOpen, setIsAddFriendModalOpen] = useState(false);
  // UserList 체크 상태 관리
  const [checkedUsers, setCheckedUsers] = useState([]);
  const user = useSelector((state) => state.user.myInfo);

  console.log(user);
  
  useEffect(() => {
    const fetchFriends = async () => {
      setIsLoading(true);
      try {
        const response = await getFriendsInfo(user.userId);
        setFriends(response);
        console.log(friends);
        
      } catch (error) {
        console.error("친구 정보를 가져오는 중 오류 발생:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFriends();
  }, []); // 컴포넌트 마운트 시 한 번 실행

  // 친구 추가 모달 오픈 함수
  const openAddFriendPage = () => {
    setIsAddFriendModalOpen(true);
  };

  // 로딩 중일 때는 로딩 애니메이션을 표시
  if (isLoading) {
    return <LoadAnimation />;
  }

  return (
    <div>
      {/* <p className="header-style-border">친구 목록</p> */}
      <div className="flex flex-col md:flex-row">
        {/* UserList 영역 */}
        <div className="w-full md:w-4/5">
          <UserList
            users={friends}
            checkedUsers={checkedUsers}
            setCheckedUsers={setCheckedUsers}
          />
        </div>

        {/* ManageFriend 영역 */}
        <div className="w-full md:w-1/5 mt-4 md:mt-0 md:ml-4">
          <ManageFriend openAddFriendPage={openAddFriendPage} checkedUsers={checkedUsers} />
        </div>
      </div>

      {/* 친구 추가 모달 */}
      {isAddFriendModalOpen && (
        <div className="modal-overlay" onClick={() => setIsAddFriendModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <AddFriends onClose={() => setIsAddFriendModalOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default FriendsList;
