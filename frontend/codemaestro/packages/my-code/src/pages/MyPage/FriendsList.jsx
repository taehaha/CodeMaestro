import React, { useState } from "react";
import UserList from '../../components/UserList';
import ManageFriend from '../Friend/ManageFriend';
import AddFriends from '../Friend/AddFriends';

import "./FriendsList.css";

const FriendsList = () => {
  const [friends, setFriends] = useState([
    { id: 1, name: "김철수" },
    { id: 2, name: "이영희" },
    { id: 3, name: "박민수" },
  ]);

  const [isAddFriendModalOpen, setIsAddFriendModalOpen] = useState(false);

  // UserList 체크 상태 관리
  const [checkedUsers, setCheckedUsers] = useState([]);

  // ✅ openAddFriendPage 함수 추가
  const openAddFriendPage = () => {
    setIsAddFriendModalOpen(true);
  };

  return (
    <div>
        <p className="header-style-border">My Friends</p>
        <div className="flex flex-col md:flex-row">
          {/* UserList 영역 */}
          <div className="w-full md:w-4/5">
            <UserList friends={friends} checkedUsers={checkedUsers} setCheckedUsers={setCheckedUsers} />
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
