import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import Swal from "sweetalert2";
import { FaUserFriends, FaCalendarAlt } from "react-icons/fa"; // 예시 아이콘
import moment from "moment"; // 날짜 포맷 라이브러리 (선택)
import {LeaveGroup } from "../../api/GroupApi";

import UserAxios from "../../api/userAxios";
import DummyGroupMembersDemo from "./Dummy";
import GroupManagement from "./GroupManagement";

const ROLE = {
  NONE: "NONE",
  MEMBER: "MEMBER",
  ADMIN: "OWNER",
};

const GroupDetail = () => {
  const user = useSelector((state) => state.user.myInfo);

  const { groupId } = useParams();

  const [group, setGroup] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("members");
  const [userRole, setUserRole] = useState(ROLE.ADMIN);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const result = await UserAxios.get(`/groups/${groupId}/detail`);
        // 그룹 정보 설정        
        setGroup(result.data);
        //더미로


        // 내 역할 설정
          const member = result.data.members.find(member => member.userId === user.userId);
          
          if (member) {
            setUserRole(member.role);
          } else {
            setUserRole("NONE");
          }      } catch (error) {
                  console.error("API 에러:", error);
  
        // 그룹 정보 에러 시 더미 데이터
        //
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [groupId]);


  // 가입 신청
  const handleJoinRequest = async () => {
    Swal.fire({
      title: "가입 신청",
      text: `${group?.name || "이 그룹"}에 가입을 신청하시겠습니까?`,
      input: 'textarea', // 텍스트 입력창 (여러 줄 입력 가능)
      inputPlaceholder: '가입 신청 메시지를 입력하세요...',
      showCancelButton: true,
      confirmButtonText: "확인",
      cancelButtonText: "취소",
      preConfirm: (message) => {
        // 입력값이 없으면 에러 메시지 출력
        if (!message) {
          Swal.showValidationMessage('메시지를 입력해주세요.');
        }
        return message;
      }
    }).then((result) => {
      if (result.isConfirmed) {
        const message = result.value; // 사용자가 입력한 메시지
        try {
          UserAxios.post('groups/requests', {
            userId: user.userId,
            groupId: group.id,
            message: message,
          });
        } catch (error) {
          console.error("가입 신청 실패!", error);
        }
      }
    });
  };
  

  // 그룹 탈퇴
  const handleLeaveGroup = () => {
    if (userRole === ROLE.ADMIN) {
      Swal.fire({
        title:"그룹 탈퇴",
        text:"그룹 소유주는 탈퇴할 수 없습니다! 그룹의 매니저를 양도하거나, 그룹 삭제 절차를 진행해 주세요."
      })
    }

    else {
      Swal.fire({
        title: "그룹 탈퇴",
        text: `정말로 이 그룹에서 탈퇴하시겠습니까?`,
        showCancelButton: true,
        confirmButtonText: "탈퇴하기",
        cancelButtonText: "취소",
      }).then((result) => {
        if (result.isConfirmed) {
          const result = LeaveGroup({groupId,userId:user.userId})

          if (result===200) {
                    Swal.fire({
                      title: "탈퇴 완료",
                      text: "그룹에서 탈퇴했습니다. 메인 페이지로 이동합니다.",
                      icon: "success",
                      confirmButtonText: "확인",
                    }).then(() => {
                      window.location.replace("/");
                    });
                  } else {
                    Swal.fire({
                      title: "탈퇴 실패",
                      text: "그룹 탈퇴 중 오류가 발생했습니다. 다시 시도해 주세요.",
                      icon: "error",
                      confirmButtonText: "확인",
                    });
                  }
        }
      });
    }
    
  };

  // 관리자 전환 (테스트용)
  const handleChangeToAdmin = () => {
    setUserRole(ROLE.ADMIN);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-60">
        <div className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  // 날짜 포맷 (moment 사용 예시)
  const formattedDate = group?.createdAt
    ? moment(group.createdAt).format("YYYY년 M월 D일")
    : null;

  return (
    <div className="container mx-auto p-4">
      {/* --------- 헤더 영역 (배경 없이 간단한 카드 형태) --------- */}
      <div className="card bg-base-100 shadow-md p-4 py-6 mb-4">
        <div className="flex items-center gap-4">
          {/* 그룹 아바타 */}
          <div className="avatar">
            <div className="w-28 h-28 rounded-full ring ring-offset-base-100 ring-offset-2 overflow-hidden">
              <img
                src={
                  group?.imageUrl ||
                  "https://placeholder.co/128"
                }
                alt="Group Avatar"
              />
            </div>
          </div>

          {/* 그룹 정보 텍스트 */}
          <div className="flex flex-col gap-1">
            <h2 className="text-2xl font-bold">
              {group?.name || `그룹 아이디: ${group.name}`}
            </h2>
            {group?.description && (
              <p className="text-gray-600 text-sm">{group.description}</p>
            )}

            <div className="flex flex-row items-center gap-4 mt-1">
              {/* 현재 인원 */}
              {group?.currentMembers !== undefined && (
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <FaUserFriends />
                  <span>멤버: {group.currentMembers}명</span>
                </div>
              )}

              {/* 생성일 */}
              {group?.createdAt && (
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <FaCalendarAlt />
                  <span>생성일: {formattedDate}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* --------- 탭 영역 --------- */}
      <div className="tabs w-full mb-4 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("members")}
          className={`tab tab-bordered transition-colors ${
            activeTab === "members" ? "tab-active border-blue-500 text-blue-500" : ""
          }`}
        >
          Members
        </button>
        <button
          onClick={() => setActiveTab("studies")}
          className={`tab tab-bordered transition-colors ${
            activeTab === "studies" ? "tab-active border-blue-500 text-blue-500" : ""
          }`}
        >
          Studies
        </button>
      </div>

      {/* --------- 탭 컨텐츠 영역 --------- */}
      {activeTab === "members" && (
        <DummyGroupMembersDemo userRole={userRole} members={group.members} />
      )}
      {activeTab === "studies" && (
        <div className="text-center text-gray-700">스터디 기록 영역</div>
      )}

      {/* --------- 우측 하단 액션 영역 --------- */}
      <div className="fixed bottom-4 right-4 flex flex-col items-end space-y-2">
        {userRole === ROLE.NONE && (
          <button
            onClick={handleJoinRequest}
            className="btn btn-primary rounded-sm"
          >
            가입 신청
          </button>
        )}

        {userRole === ROLE.MEMBER && (
          <>
            <button className="btn btn-success rounded-sm">그룹회의 생성</button>
            <button
              onClick={handleChangeToAdmin}
              className="btn btn-neutral rounded-sm"
            >
              관리자 전환
            </button>
          </>
        )}

        {userRole === ROLE.ADMIN && (
          <button 
          onClick={() => setIsModalOpen(true)}
          className=" btn btn-neutral rounded-sm">
          그룹 관리
          </button>
        )}
{/* 
        {(userRole === ROLE.MEMBER || userRole === ROLE.ADMIN) && (
          <button  className="btn btn-primary rounded-sm">그룹 초대</button>
        )} */}
      </div>

      {/*--- 그룹관리 모달 ---*/}
      {isModalOpen && (
        <div className="modal modal-open">
          <div className="modal-box relative rounded-sm w-full max-w-4xl min-h-[80vh] bg-white shadow-xl">
            <button
              onClick={() => setIsModalOpen(false)}
              className="btn btn-sm btn-circle absolute right-2 top-2"
            >
              ✕
            </button>
            <GroupManagement
            group={group}
            />
          </div>

          <div
            className="modal-backdrop"
            onClick={() => setIsModalOpen(false)}
          ></div>
        </div>
      )}



      {/* --------- 좌측 하단 '그룹 탈퇴' (MEMBER, ADMIN) --------- */}
      {userRole !== ROLE.NONE && (
        <div className="fixed bottom-4 left-4">
          <p
            className="text-gray-400 hover:brightness-75 cursor-pointer text-sm"
            onClick={handleLeaveGroup}
          >
            그룹 탈퇴
          </p>
        </div>
      )}
    </div>
  );
};

export default GroupDetail;
