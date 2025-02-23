import PropTypes from "prop-types";
import { useState } from "react";
import { DeleteGroup, PutGroup } from "../../api/GroupApi";
import Swal from "sweetalert2";

const GroupManagement = ({group}) => {
  const groupId = group.id; // 예시용 그룹 ID


  // 🔍 필터링을 위한 상태 (검색어, 역할 필터)
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");  
  // 🔎 필터링된 멤버 리스트
  const filteredMembers = group.members.filter((member) => {
    const matchesSearch = member.userNickname.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "ALL" || member.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // 그룹 관리자 권한 양도 함수
  const handlePutGroup = (groupId, newOwner) => {
    const payload = {
      groupId,  
      currentOwnerId: group.ownerId,
      newOwnerId: newOwner.userId,
    };

    Swal.fire({
      title: "권한 변경",
      icon: "warning",
      text: `정말로 그룹 관리자 권한을 ${newOwner.userNickname}님에게 양도하시겠습니까? \n이 선택은 되돌릴 수 없습니다.`,
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

    }).then(async (result) => {
      if (result.isConfirmed) {
        const status = await PutGroup(groupId, payload);
        if (status === 200) {
          Swal.fire({
            title: "권한 변경 완료",
            text: "그룹 관리자 권한이 성공적으로 양도되었습니다.",
            icon: "success",
            iconColor:"#5FD87D",
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
          }).then((res)=>{
            if (res.isConfirmed) {
              window.location.reload()
            }
          })
        } else {
          Swal.fire({
            title: "권한 변경 실패",
            text: "관리자 권한 변경 중 오류가 발생했습니다.",
            icon: "error",
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
        }
      }
    });
  };

  // 그룹 삭제 함수
  const handleDeleteGroup = async (groupId) => {
    Swal.fire({
      title: "그룹 삭제",
      icon: "warning",
      text: "정말로 이 그룹을 삭제하시겠습니까? 이 선택은 되돌릴 수 없습니다.",
      showCancelButton: true,
      confirmButtonText: "삭제",
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

    }).then(async (result) => {
      if (result.isConfirmed) {
        const status = await DeleteGroup(groupId);
        if (status === 200 || status === 204) {
          Swal.fire({
            title: "삭제 완료",
            text: "그룹이 성공적으로 삭제되었습니다. 목록으로 이동합니다.",
            icon: "success",
            iconColor:"#5FD87D",
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
  
          }).then(() => {
            window.location.replace("/mypage?tab=groups");
          });
        } else {
          Swal.fire({
            title: "삭제 실패",
            text: "그룹 삭제 중 오류가 발생했습니다. 다시 시도해 주세요.",
            icon: "error",
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
        }
      }
    });
  };

  return (
    <div className="relative p-2 max-w-3xl mx-auto mt-5">
      {/* 그룹 정보 */}
      <div className="mb-6 border-b pb-4">
        <h2 className="text-xl text-gray-800 mb-3">{group.name}</h2>
        <p className="text-gray-600">{group.description}</p>
        <p className="mt-2 text-gray-700">
          <span className="font-semibold">그룹 관리자:</span> {group.ownerNickname}
        </p>
      </div>

      {/* 🔎 필터 UI 추가 */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        {/* 이름 검색 */}
        <input
          type="text"
          placeholder="🔍︎ 멤버 검색..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 border border-gray-300 p-2 rounded-md"
        />

        {/* 역할 필터 */}
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
        >
          <option value="ALL">전체</option>
          <option value="OWNER">관리자</option>
          <option value="MEMBER">멤버</option>
        </select>
      </div>

      {/* 멤버 목록 */}
      <div className="mb-20">
        <h3 className="text-2xl font-semibold text-gray-800 mb-4">멤버 목록</h3>
        <ul className="space-y-3">
          {filteredMembers.length > 0 ? (
            filteredMembers.map((member) => (
              <li
                key={member.userId}
                className="flex items-center justify-between p-3.5 border border-gray-200 rounded-md hover:shadow-md transition-all duration-200"
              >
                <span className="text-gray-700 font-medium">
                  {member.userNickname}{" "}
                  {member.role === "OWNER" && (
                    <span className="text-yellow-500 text-sm">(관리자)</span>
                  )}
                </span>
                {member.role !== "OWNER" && (
                  <button
                    onClick={() => handlePutGroup(groupId, member)}
                    className="px-3 py-0.5 bg-[#ffcc00] hover:bg-[#f0c000] rounded-md focus:outline-none"
                  >
                    권한 양도
                  </button>
                )}
              </li>
            ))
          ) : (
            <li className="text-gray-500">검색된 멤버가 없습니다.</li>
          )}
        </ul>
      </div>

      {/* 그룹 삭제 버튼 (좌측 하단) */}
      <button
        onClick={() => handleDeleteGroup(groupId)}
        className="absolute bottom-4 left-4 text-gray-500 hover:text-gray-700 text-sm transition-colors duration-200"
      >
        그룹 삭제
      </button>
    </div>
  );
};

GroupManagement.propTypes = {
    group: PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      description: PropTypes.string,
      ownerId: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
        .isRequired,
      ownerNickname: PropTypes.string.isRequired,
      members: PropTypes.arrayOf(
        PropTypes.shape({
          userId: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
            .isRequired,
          userNickname: PropTypes.string.isRequired,
          role: PropTypes.string.isRequired,
          // joinedAt, profileImageUrl 등 추가 필드가 있을 경우 아래에 추가
        })
      ),
    }).isRequired,
  };


export default GroupManagement;
