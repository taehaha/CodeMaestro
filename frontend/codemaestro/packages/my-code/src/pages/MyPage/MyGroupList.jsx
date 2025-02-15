import React, { useEffect, useState } from "react";
import "./MyGroupList.css";
import GroupModal from "./GroupModal";
import { getMyGroupList } from "../../api/GroupApi";
import LoadAnimation from "../../components/LoadAnimation";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import UserAxios from "../../api/userAxios";
import { useSelector } from "react-redux";

const MyGroupList = () => {
  const [groups, setGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const user = useSelector((state) => state.user.myInfo);
  const userId = user.userId;

  useEffect(() => {
    setIsLoading(true);
    const fetchGroups = async () => {
      try {
        const myGroup = await getMyGroupList(userId);
        setGroups(myGroup || []);
      } catch (error) {
        console.error("그룹 목록을 가져오는 중 오류 발생:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchGroups();
  }, [userId]);

  const handleCreateGroup = async (newGroup) => {
    console.log("그룹 생성:", userId, newGroup);
    try {
      const result = await UserAxios.post('/groups', {
        userId: userId, // 오타 수정: uesrId → userId
        name: newGroup.name,
        description: newGroup.description,
      });
      navigate(`/group/${result.data.id}`);
      // 필요하다면 그룹 목록을 새로고침하는 로직 추가 가능
    } catch (error) {
      console.error("그룹 생성 중 오류 발생:", error);
    }
  };

  const handleMoveGroup = (group) => {
    Swal.fire({
      title: "그룹 이동",
      text: `${group.name} 그룹으로 이동하시겠습니까?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "이동",
      cancelButtonText: "취소",
      width: "500px",
      background: "#f8f9fa",
      confirmButtonColor: "#FFCC00",
      cancelButtonColor: "#ddd",
      customClass: {
        popup: "swal-custom-popup",       // 전체 팝업 스타일
        title: "swal-custom-title",       // 제목 스타일
        htmlContainer: "swal-custom-text", // 본문 텍스트 스타일
        confirmButton: "swal-custom-button", // 버튼 스타일
        cancelButton: "swal-custom-button2" // 버튼 스타일
      }
    }).then((result) => {
      if (result.isConfirmed) {
        navigate(`/group/${group.id}`);
      }
    });
  };

  // 로딩 상태일 경우 로딩 애니메이션 표시
  if (isLoading) {
    return <LoadAnimation />;
  }

  return (
    <div className="group-list">
      <div className="group-header">
        <h2>내 그룹</h2>
        <button 
          className="create-group" 
          onClick={() => setIsModalOpen(true)}
        >
          그룹 생성하기
        </button>
      </div>
      <hr />
      {groups.length === 0 ? (
        <div className="empty-group-list">
          <p>등록된 그룹이 없습니다. 그룹을 생성해보세요!</p>
        </div>
      ) : (
        <ul>
          {groups.map((group) => (
            <li key={group.id} className="group-item">
              <span className="group-name">{group.name}</span>
              <span className="member-count">{group.currentMembers}명</span>
              <div>
                <button 
                  className="enter-btn" 
                  onClick={() => handleMoveGroup(group)}
                >
                  입장
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      {isModalOpen && (
        <GroupModal 
          onClose={() => setIsModalOpen(false)} 
          onCreate={handleCreateGroup} 
        />
      )}
    </div>
  );
};

export default MyGroupList;
