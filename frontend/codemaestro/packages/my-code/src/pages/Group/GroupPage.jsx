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
import GroupStudiesPage from "./GroupStudies";

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
  const handleLeaveGroup = async () => {
    if (userRole === ROLE.ADMIN) {
      await Swal.fire({
        title: "그룹 탈퇴",
        text: "그룹 소유주는 탈퇴할 수 없습니다! \n 그룹의 매니저를 양도하거나, 그룹 삭제 절차를 진행해 주세요.",
        icon:"error",
        width: "500px",
          background: "#f8f9fa",
          confirmButtonColor: "#FFCC00",
          confirmButtonText: "확인",
          customClass: {
            popup: "swal-custom-popup",       // 전체 팝업 스타일
            title: "swal-custom-title",       // 제목 스타일
            htmlContainer: "swal-custom-text", // 본문 텍스트 스타일
            confirmButton: "swal-custom-button" // 버튼 스타일
          }

      });
    } else {
      const result = await Swal.fire({
        title: "그룹 탈퇴",
        text: `정말로 이 그룹에서 탈퇴하시겠습니까?`,
        showCancelButton: true,
        confirmButtonText: "탈퇴하기",
        cancelButtonText: "취소",
      });
  
      if (result.isConfirmed) {
        try {
          const status = await await LeaveGroup({ groupId, userId: user.userId });
          console.log(status);
          if (status === 200) {
            await Swal.fire({
              title: "탈퇴 완료",
              text: "그룹에서 탈퇴했습니다. 메인 페이지로 이동합니다.",
              icon: "success",
              confirmButtonText: "확인",
            });
            window.location.replace("/");
          } else {
            await Swal.fire({
              title: "탈퇴 실패",
              text: "그룹 탈퇴 중 오류가 발생했습니다. 다시 시도해 주세요.",
              icon: "error",
              confirmButtonText: "확인",
            });
          }
        } catch (error) {
          console.error("그룹 탈퇴 중 에러 발생:", error);
          await Swal.fire({
            title: "탈퇴 실패",
            text: "그룹 탈퇴 중 오류가 발생했습니다. 다시 시도해 주세요.",
            icon: "error",
            confirmButtonText: "확인",
          });
        }
      }
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
      <div className="card bg-base-100 shadow-md p-6 py-6 px-8 mb-6">
        <div className="flex items-center gap-10">
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
          <div className="flex flex-col gap-3">
            <h2 className="text-xl font-bold">
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
      <div className="sidebar-menu w-full max-w-[1000px] mx-auto flex justify-center border-b border-gray-200 bg-[#F9FAFB]">
        <button
          onClick={() => setActiveTab("members")}
          className={`sidebar-item transition-colors relative ${
            activeTab === "members" ? "text-black font-semibold active" : "text-gray-500"
          } flex-1`} // 🔥 flex-1: 버튼 너비 동일하게 자동 조정
        >
          Members
        </button>
        <button
          onClick={() => setActiveTab("studies")}
          className={`sidebar-item transition-colors relative ${
            activeTab === "studies" ? "text-black font-semibold active" : "text-gray-500"
          } flex-1`} // 🔥 flex-1: 버튼 너비 동일하게 자동 조정
        >
          Studies
        </button>
      </div>



      {/* --------- 탭 컨텐츠 영역 --------- */}
      {activeTab === "members" && (
        <DummyGroupMembersDemo userRole={userRole} members={group.members} />
      )}
      {activeTab === "studies" && (
        <div className="text-center text-gray-700">
          <GroupStudiesPage></GroupStudiesPage>
        </div>
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
          </>
        )}

        {userRole === ROLE.ADMIN && (
          <div className="flex gap-2">
          <button className="btn btn-success rounded-m">그룹회의 생성</button>
                      <button 
          onClick={() => setIsModalOpen(true)}
          className=" btn btn-[#5FD87D] rounded-m">
          그룹 관리
          </button>
          </div>

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
