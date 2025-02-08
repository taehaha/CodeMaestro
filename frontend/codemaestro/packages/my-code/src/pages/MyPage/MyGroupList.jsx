import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

import "./MyGroupList.css";
import GroupModal from "./GroupModal";
import { getMyGroupList } from "../../api/GroupApi";
import LoadAnimation from "../../components/LoadAnimation";
import UserAxios from "../../api/userAxios";

const MyGroupList = () => {
  const [groups, setGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const user = useSelector((state) => state.user.myInfo);
  const userId = user.userId;

  useEffect(() => {
    // 로딩 시작
    setIsLoading(true);
    // 그룹 리스트 가져오기
    const fetchGroups = async (userId) => {
      try {
        const myGroup = await getMyGroupList(userId);
        setGroups(myGroup || []);
      } catch (error) {
        console.error("그룹 목록을 가져오는 중 오류 발생:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchGroups(userId);
  }, [userId]);

  const handleCreateGroup = async (newGroup) => {
    try {
      const result = await UserAxios.post("/groups", {
        userId: userId, // API에 맞게 키명을 수정
        name: newGroup.name,
        description: newGroup.description,
      });
      console.log(result);
      // 그룹 생성 후 리스트 갱신이 필요하면 다시 fetchGroups()를 호출하거나 페이지를 새로고침
      // 예: fetchGroups(userId);
    } catch (error) {
      console.error("그룹 생성 오류:", error);
      Swal.fire({
        icon: "error",
        title: "그룹 생성 실패",
        text: "그룹 생성 중 오류가 발생했습니다. 다시 시도해주세요.",
      });
    }
  };

  const handleMoveGroup = (group) => {
    Swal.fire({
      title: "그룹 이동",
      text: `${group.name} 그룹으로 이동하시겠습니까?`,
      showCancelButton: true,
      confirmButtonText: "이동",
      cancelButtonText: "취소",
    }).then((result) => {
      if (result.isConfirmed) {
        navigate(`/group/${group.id}`);
      }
    });
  };

  if (isLoading) {
    return <LoadAnimation />;
  }

  return (
    <div className="container mx-auto p-4">
      {/* 헤더 영역 */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">내 그룹</h2>
        <button
          className="btn btn-primary"
          onClick={() => setIsModalOpen(true)}
        >
          그룹 생성하기
        </button>
      </div>
      <hr className="mb-4" />

      {/* 그룹 목록이 있을 경우 */}
      {groups.length > 0 ? (
        <ul className="grid grid-cols-1 gap-4">
          {groups.map((group) => (
            <li
              key={group.id}
              className="card bg-base-100 shadow-xl p-4 flex justify-between items-center"
            >
              <div>
                <h3 className="text-xl font-semibold">{group.name}</h3>
                <p className="text-gray-500">{group.currentMembers}명 참여 중</p>
              </div>
              <button
                className="btn btn-secondary"
                onClick={() => handleMoveGroup(group)}
              >
                입장
              </button>
            </li>
          ))}
        </ul>
      ) : (
        // 그룹 목록이 없을 때 안내 메시지 표시
        <div className="flex justify-center mt-10">
          <div className="alert alert-info shadow-lg w-full max-w-md">
            <div className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="stroke-current flex-shrink-0 h-6 w-6 mr-2"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 16h-1v-4h-1m1-4h.01M12 20h.01M20 12a8 8 0 11-16 0 8 8 0 0116 0z"
                />
              </svg>
              <span>등록된 그룹이 없습니다. 그룹을 생성해보세요!</span>
            </div>
          </div>
        </div>
      )}

      {/* 그룹 생성 모달 */}
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
