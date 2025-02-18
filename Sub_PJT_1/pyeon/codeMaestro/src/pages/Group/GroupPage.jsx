import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import Swal from "sweetalert2";
import { FaUserFriends, FaCalendarAlt } from "react-icons/fa"; // 예시 아이콘
import moment from "moment"; // 날짜 포맷 라이브러리 (선택)

import UserAxios from "../../api/userAxios";
import DummyGroupMembersDemo from "./Dummy";

const ROLE = {
  NONE: "NONE",
  MEMBER: "MEMBER",
  ADMIN: "ADMIN",
};

const GroupDetail = () => {
  const user = useSelector((state) => state.user.myInfo);
  const { groupId } = useParams();

  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("members");
  const [userRole, setUserRole] = useState(ROLE.NONE);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 동시에 두 개의 API 호출
        const result = await UserAxios.get(`/groups/${groupId}`);
        // 그룹 정보 설정
        setGroup(result.data);
        // 내 역할 설정
        setUserRole(result.data.role)
      } catch (error) {
        console.error("API 에러:", error);
  
        // 그룹 정보 에러 시 더미 데이터
        setGroup({
          "id":3,
          "name":"더미데이터 그룹",
          "description":"더미 데이터 그룹입니다.",
          "ownerId":3,
          "ownerNickname":"user3",
          "currentMembers":2,
          "createdAt":"2025-01-23T15:12:50.068111",
          "updatedAt":"2025-01-23T17:18:06.077316",
          "members":[
            {"userId":1,
          "userNickname":"더미유저 1",
          "profileImageUrl":'',
          "role":"MEMBER",
          "joinedAt":"2025-01-23T15:12:50.102206"},
          {"userId":3,
          "userNickname":"더미유저 2",
          "profileImageUrl":"",
          "role":"OWNER",
          "joinedAt":null}
        ]});
        //
        setUserRole(group.role);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [groupId, user.myInfo.id]);


  // 가입 신청
  const handleJoinRequest = () => {
    Swal.fire({
      title: "가입 신청",
      text: `${group?.name || "이 그룹"}에 가입을 신청하시겠습니까?`,
      showCancelButton: true,
      confirmButtonText: "확인",
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
        // 실제 axios.post("/groups/join") 예시
        setUserRole(ROLE.MEMBER);
      }
    });
  };

  // 그룹 탈퇴
  const handleLeaveGroup = () => {
    Swal.fire({
      title: "그룹 탈퇴",
      text: `정말로 이 그룹에서 탈퇴하시겠습니까?`,
      showCancelButton: true,
      confirmButtonText: "탈퇴하기",
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
        // 실제 axios.delete("/groups/{groupId}/{userId}")
        setUserRole(ROLE.NONE);
      }
    });
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
  const formattedDate = group?.created_at
    ? moment(group.created_at).format("YYYY년 M월 D일")
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
                  "https://placeholder.co/128?text=Group+Avatar"
                }
                alt="Group Avatar"
              />
            </div>
          </div>

          {/* 그룹 정보 텍스트 */}
          <div className="flex flex-col gap-1">
            <h2 className="text-2xl font-bold">
              {group?.name || `그룹 아이디: ${groupId}`}
            </h2>
            {group?.description && (
              <p className="text-gray-600 text-sm">{group.description}</p>
            )}

            <div className="flex flex-row items-center gap-4 mt-1">
              {/* 현재 인원 */}
              {group?.current_members !== undefined && (
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <FaUserFriends />
                  <span>멤버: {group.current_members}명</span>
                </div>
              )}

              {/* 생성일 */}
              {group?.created_at && (
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
        <DummyGroupMembersDemo userRole={userRole} />
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
            <button className="btn btn-success rounded-sm">그룹스터디 생성</button>
            <button
              onClick={handleChangeToAdmin}
              className="btn btn-neutral rounded-sm"
            >
              관리자 전환
            </button>
          </>
        )}

        {userRole === ROLE.ADMIN && (
          <button className="btn btn-neutral rounded-sm">그룹 관리</button>
        )}

        {(userRole === ROLE.MEMBER || userRole === ROLE.ADMIN) && (
          <button className="btn btn-primary rounded-sm">그룹 초대</button>
        )}
      </div>

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
