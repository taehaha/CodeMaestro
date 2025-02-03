import UserDetail from "./UserDetail";
import PropTypes from "prop-types";
import { useState } from "react";

const UserList = ({ checkedUsers, setCheckedUsers, addPage, searchTerm }) => {
  // 실제 백엔드 연동 전 테스트용 임시 유저 리스트
  const [tempList] = useState([
    { name: "김친구", id: "friends1", profileimage: "/test_profile.png", profiletext: "백엔드 연결 전 친구 테스트용" },
    { name: "박친구", id: "friends2", profileimage: "/test_profile.png", profiletext: "실제 백엔드 연결시엔" },
    { name: "이친구", id: "friends3", profileimage: "/test_profile.png", profiletext: "이 리스트 컴포넌트에" },
    { name: "제갈친구", id: "friends4", profileimage: "/test_profile.png", profiletext: "검색한 유저와 친구 목록이" },
    { name: "밥친구", id: "friends5", profileimage: "/test_profile.png", profiletext: "유동적으로 들어갑니다." },
    { name: "김친구", id: "friends1", profileimage: "/test_profile.png", profiletext: "백엔드 연결 전 친구 테스트용" },
    { name: "박친구", id: "friends2", profileimage: "/test_profile.png", profiletext: "실제 백엔드 연결시엔" },
  ]);

  // 부모에서 내려받은 searchTerm 으로 필터링
  const filteredUsers = tempList.filter((user) => {
    const matchName = user.name.includes(searchTerm || "");
    const matchId = user.id.includes(searchTerm);
    return matchName || matchId;
  });

  // refresh 버튼(등)을 누르면 상위 컴포넌트에서 다시 불러오도록 할 수도 있음 (현재는 미사용)
  // const handleRefresh = () => {
  //   console.log('상위에서 유저 리스트 다시 불러오는 로직');
  // };

  return (
    <ul role="list" className="p-6 divide-y divide-slate-200 overflow-y-auto h-[300px] mt-3">
      {filteredUsers.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 text-slate-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12h6m-3-3v6m6-9h.01M6 6h.01M18 18h.01M6 18h.01"
            />
          </svg>
          <h2 className="text-lg font-semibold text-slate-700">
            No Users Found
          </h2>
        </div>
      ) : (
        filteredUsers.map((user, index) => (
          <UserDetail
            key={`${user.id}-${index}`}
            user={user}
            checkedUsers={checkedUsers}
            setCheckedUsers={setCheckedUsers}
            addPage={addPage}
          />
        ))
      )}
    </ul>
  );
};

UserList.propTypes = {
  checkedUsers: PropTypes.array,
  setCheckedUsers: PropTypes.func,
  addPage: PropTypes.bool,
  searchTerm: PropTypes.string,  // 추가
};

export default UserList;
