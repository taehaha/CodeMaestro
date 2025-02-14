import UserDetail from "./UserDetail";
import PropTypes from "prop-types";
import { useState } from "react";

const UserList = ({ users, checkedUsers, setCheckedUsers, addPage, searchTerm }) => {
  // searchTerm을 소문자로 변환하여 대소문자 구분 없이 검색
  const term = (searchTerm || "").toLowerCase();

  // 필터링: nickname 또는 loginId에 검색어가 포함되어 있는지 확인
  const filteredUsers = users.filter((user) => {
    const matchNickname = user.nickname?.toLowerCase().includes(term);
    const matchLoginId = user.loginId?.toLowerCase().includes(term);
    return matchNickname || matchLoginId;
  });

  return (
    <ul role="list" className="p-6 divide-y divide-slate-200 max-h-[400px] mt-3">
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
            key={`${user.userId}-${index}`}
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
  users: PropTypes.array,
  setCheckedUsers: PropTypes.func,
  addPage: PropTypes.bool,
  searchTerm: PropTypes.string,
};

export default UserList;
