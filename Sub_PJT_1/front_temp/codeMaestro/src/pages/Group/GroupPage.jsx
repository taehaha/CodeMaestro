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
  // const user = useSelector((state) => state.user.myInfo);
  // 더미데이터 일단 ㄱㄱ
  const user ={myInfo:{
    id: 'kopybara8421',
    name: '익명의 카피바라 8421',
    email: 'test@test.com',
    description: '오늘도 열심히 코딩합시다',
    tier: 27,
    // profile_image_url,
}}
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
        const [groupRes, roleRes] = await Promise.all([
          UserAxios.get(`/groups/${groupId}`),
          UserAxios.get(`/groups/${groupId}/${user.myInfo.id}`),
        ]);
        // 그룹 정보 설정
        setGroup(groupRes.data);
        // 내 역할 설정
        setUserRole(roleRes.data || ROLE.NONE);
      } catch (error) {
        console.error("API 에러:", error);
  
        // 그룹 정보 에러 시 더미 데이터
        setGroup({
          id: groupId,
          name: "Dummy Group",
          description: "이 그룹은 더미 데이터입니다.",
          owner_id: 101,
          current_members: 5,
           // [
          //   {
          //     id:1,
          //     profilimage_url:'프로필이미지',
          //     name:'닉네임',
          //     role:'Member',
          //   },
          //   {
          //     id:2,
          //     profilimage_url:'프로필이미지2',
          //     name:'닉네임2',
          //     role:'Manager',
          //   },
          // ],
          created_at: "2025-01-31T12:00:00Z",
          imageUrl: null,
        });
        // 내 역할 에러
        setUserRole(ROLE.NONE);
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
    }).then((result) => {
      if (result.isConfirmed) {
        // 실제 axios.delete("/groups/{groupId}/members/{userId}")
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
