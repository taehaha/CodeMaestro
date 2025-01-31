import React, { useState } from "react";
import "./GroupList.css";
import GroupModal from "./GroupModal";

const GroupList = () => {
  const [groups, setGroups] = useState([
    { id: 1, name: "SSAFY 13기", members: 5 },
    { id: 2, name: "코테준비 스터디", members: 4 },
    { id: 3, name: "A형 대비 그룹", members: 2 },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const handleLeaveGroup = (id) => {
    setGroups(groups.filter((group) => group.id !== id));
  };

  const handleCreateGroup = (newGroup) => {
    setGroups([...groups, { id: groups.length + 1, name: newGroup.name, members: 1 }]);
  };


  return (
    <div className="group-list">
      <div className="group-header">
        <h2>내 그룹</h2>
        <button className="create-group" onClick={() => setIsModalOpen(true)}>그룹 생성하기</button>
      </div>
      <hr />
      <ul>
        {groups.map((group) => (
          <li key={group.id} className="group-item">
            <span>{group.name}</span>
            <span>{group.members}명</span>
            <div>
              <button className="enter-btn">입장</button>
              <button className="leave-btn" onClick={() => handleLeaveGroup(group.id)}>탈퇴</button>
            </div>
          </li>
        ))}
      </ul>
      {/* 모달이 열릴 때만 표시 */}
      {isModalOpen && <GroupModal onClose={() => setIsModalOpen(false)} onCreate={handleCreateGroup} />}
    </div>
  );
};

export default GroupList;
