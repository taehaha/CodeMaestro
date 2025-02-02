import React from "react";
import GroupTable from "./GrouTable";

// axios 연결이 안된 상태라 더미 데이터로 진행합니다.
function DummyGroupMembersDemo({userRole, members}) {
  // 테스트용 더미 데이터
  const dummyMembers = React.useMemo(
    () => [
      {
        userId: 1,
        name: "Alice",
        profileUrl: "https://randomuser.me/api/portraits/women/10.jpg",
        role: "MEMBER",
      },
      {
        userId: 2,
        name: "Bob",
        profileUrl: "https://randomuser.me/api/portraits/men/11.jpg",
        role: "MEMBER",
      },
      {
        userId: 3,
        name: "Charlie",
        profileUrl: "https://randomuser.me/api/portraits/men/12.jpg",
        role: "ADMIN",
      },
      {
        userId: 1,
        name: "Alice",
        profileUrl: "https://randomuser.me/api/portraits/women/10.jpg",
        role: "MEMBER",
      },
      {
        userId: 2,
        name: "Bob",
        profileUrl: "https://randomuser.me/api/portraits/men/11.jpg",
        role: "MEMBER",
      },
      {
        userId: 3,
        name: "Charlie",
        profileUrl: "https://randomuser.me/api/portraits/men/12.jpg",
        role: "ADMIN",
      },
      {
        userId: 1,
        name: "Alice",
        profileUrl: "https://randomuser.me/api/portraits/women/10.jpg",
        role: "MEMBER",
      },
      {
        userId: 2,
        name: "Bob",
        profileUrl: "https://randomuser.me/api/portraits/men/11.jpg",
        role: "MEMBER",
      },
      {
        userId: 3,
        name: "Charlie",
        profileUrl: "https://randomuser.me/api/portraits/men/12.jpg",
        role: "ADMIN",
      },
    ],
    []
  );

  // 관리자 권한을 테스트하고 싶다면 "ADMIN"으로,
  // 일반 권한을 테스트하고 싶다면 "MEMBER"로 바꿔보세요.
  const userRoles = userRole;

  return (
      <div className="w-3/5 mx-auto">
        <GroupTable members={members} userRole={userRoles} />
      </div>
  );
}

export default DummyGroupMembersDemo;
