import React, { useEffect, useState } from "react";
import "./GroupList.css";
import GroupModal from "./GroupModal";
import { getMyGroupList } from "../../api/GroupApi";
import LoadAnimation from "../../components/LoadAnimation";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
const GroupList = () => {
  const [groups, setGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // 로딩 상태 추가
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate()
  useEffect(() => {
    // 로딩 시작
    setIsLoading(true);
    // 그룹 리스트 가져오기
    const fetchGroups = async () => {
      try {
        const myGroup = await getMyGroupList(); // 비동기 호출
        setGroups(myGroup);
      } catch (error) {
        console.error("그룹 목록을 가져오는 중 오류 발생:", error);
      } finally {
        console.log(groups);
        
        setIsLoading(false); // 로딩 종료
      }
    };
    fetchGroups();
  }, []);

  const handleCreateGroup = (newGroup) => {
    setGroups([...groups, { id: groups.length + 1, name: newGroup.name, members: 1 }]);
  };

  const handleMoveGroup = (group) => {
    Swal.fire({
      title: "그룹 이동",
      text: `${group.name} 그룹으로 이동하시겠습니까?`,
      showCancelButton: true, // true 값으로 설정
      confirmButtonText: "이동", // 확인 버튼 텍스트 지정
      cancelButtonText: "취소", // 취소 버튼 텍스트 지정
    }).then((result) => { 
      if (result.isConfirmed) {  // result.isConfirmed가 true일 때만 이동
        navigate(`/group/${group.groupId}`);
      }
    });
  };
  if (isLoading) {
    return <LoadAnimation />; // 로딩 중일 때 로딩 애니메이션 표시
  }

  return (
    <div className="group-list">
      <div className="group-header">
        <h2>내 그룹</h2>
        <button className="create-group" onClick={() => setIsModalOpen(true)}>그룹 생성하기</button>
      </div>
      <hr />
      <ul>
        {groups.map((group) => (
          <li key={group.groupId} className="group-item">
            <span>{group.name}</span>
            <span>{group.members}명</span>
            <div>
              <button className="enter-btn" onClick={()=>{handleMoveGroup(group)}}>입장</button>
            </div>
          </li>
        ))}
      </ul>
      {isModalOpen && <GroupModal onClose={() => setIsModalOpen(false)} onCreate={handleCreateGroup} />}
    </div>
  );
};

export default GroupList;
