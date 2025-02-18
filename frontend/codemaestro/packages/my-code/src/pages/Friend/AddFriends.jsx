import { useState } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import UserList from "../../components/UserList";
import { searchUserInfo } from "../../api/FriendApi";

const AddFriends = ({ onClose }) => {
  const [checkedUsers, setCheckedUsers] = useState([]); 
  const [searchInput, setSearchInput] = useState("");   
  const [searchResult, setSearchResult] = useState([]); // 검색 결과 저장

  // 검색어 입력 핸들러
  const handleInputChange = (e) => {
    setSearchInput(e.target.value);
  };

  // 검색 버튼 or 엔터(submit) 시
  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const response = await searchUserInfo(searchInput);
      
      // 응답 데이터가 배열이 아닐 경우 빈 배열로 fallback
      setSearchResult(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error("검색 오류:", error);
      setSearchResult([]);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center">
      {/* 모달 컨테이너 */}
      <div className="bg-white p-6 rounded-lg w-full max-w-md mx-auto"
       style={{
        width: "450px", // 🔥 가로 크기 고정
        minHeight: "400px", // 🔥 최소 높이 설정
        maxHeight: "500px", // 🔥 최대 높이 설정
        overflowY: "auto", // 🔥 검색 결과가 많아지면 스크롤
        display: "flex",
        flexDirection: "column",
      }}>
        {/* 검색 폼 */}
        <form className="mb-4" onSubmit={handleSearch}>
          <label
            htmlFor="friend-search"
            className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white"
          >
            Search Friends
          </label>
        
        {/* 타이틀 */}
        <h2 className="text-lg pb-3">친구 추가</h2>
        
          <div className="relative">
            {/* 검색 아이콘 */}
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <svg
                className="w-4 h-4 text-gray-500 dark:text-gray-400"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 20 20"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                />
              </svg>
            </div>
            {/* 검색 input */}
            <input
              type="search"
              id="friend-search"
              value={searchInput}
              onChange={handleInputChange}
              className="block w-full p-3 pl-10 text-sm text-gray-900 border 
                         border-gray-300 rounded-md bg-gray-50"
              placeholder="닉네임을 입력해주세요."
            />
            {/* 검색 버튼 (type="submit") */}
            <button
              type="submit"
              className="text-black absolute right-1 bottom-1 bg-[#ffcc00] 
                         hover:bg-[#f0c000] font-medium rounded-md text-sm px-4 py-2 
                         dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            >
              검색
            </button>
          </div>
        </form>



        {/* 검색 결과를 UserList에 전달 */}
        <div style={{ flexGrow: 1, minHeight: "250px" }}>
        {searchResult.length > 0 ? (
          <UserList
            users={searchResult}
            userData={searchResult}
            checkedUsers={checkedUsers}
            setCheckedUsers={setCheckedUsers}
            addPage={true}
            searchTerm={searchInput}
          />
        ) : (
          <p className="text-center text-gray-500">검색 결과가 없습니다.</p>
        )}
      </div>

        {/* 버튼 영역 */}
        <div className="flex justify-end gap-2 mt-12 fixed bottom-4 right-4">
          <button
            className="text-black bg-[#ddd] hover:bg-[#ccc] focus:ring-4 
                       focus:outline-none focus:ring-gray-300 font-medium 
                       rounded-md text-sm px-4 py-2"
            onClick={onClose}
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};

AddFriends.propTypes = {
  onClose: PropTypes.func.isRequired,
};

export default AddFriends;
