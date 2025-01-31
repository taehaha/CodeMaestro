import { useState } from "react";
import UserAxios from "../../api/userAxios";
import GroupList from "./GroupList";
import LoadAnimation from "../../components/LoadAnimation";

const SearchGroup = () => {
  const [input, setInput] = useState("");
  const [result, setResult] = useState([]);
  const [loading, setLoading] = useState(false); // 로딩 상태에러

  const getSearchGroup = async (keyword) => {
    setLoading(true);
    try {
      const result = await UserAxios.get("/groups", {
        params: {
          // keyword={input} 부분을 keyword: input 으로 수정
          keyword: keyword,
        },
      });
      // return result.data; // 실제로 서버에서 반환하는 데이터 구조 확인 필요
      return [{name:"더미검색그룹1", groupImage:'/test_profile.png', groupRanking:1, points:9999},
        {name:"더미검색그룹2", groupImage:'/test_profile.png', groupRanking:2, points:9998}
    ]} 
    catch (error) {
      console.error("그룹 검색 중 오류:", error);
      // 임시로 빈 배열 반환 또는 에러 상태에 따라 UI 표시
      return [{name:"더미검색그룹1", groupImage:'/test_profile.png', groupRanking:1, points:9999},
        {name:"더미검색그룹2", groupImage:'/test_profile.png', groupRanking:2, points:9998}
    ];
    } finally {
        // 로딩 종료
        setLoading(false);
      }
  };

  const handleInput = (e) => {
    setInput(e.target.value);
  };

  // 폼 submit 이벤트로 검색 요청
  const handleSearch = async (e) => {
    e.preventDefault();
    const data = await getSearchGroup(input);
    setResult(data);
  };

  return (
    <div>
      {/* 검색 폼 */}
      <form className="max-w-md mx-auto" onSubmit={handleSearch}>
        <label
          htmlFor="default-search"
          className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white"
        >
          Search
        </label>

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
            id="default-search"
            value={input}
            onChange={handleInput}
            className="block w-full p-4 pl-10 text-sm text-gray-900 border border-gray-300 rounded-sm bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Search Groups"
          />

          {/* 검색 버튼 (type=submit) */}
          <button
            type="submit"
            className="text-white absolute right-2.5 bottom-2.5 bg-blue-700 
                       hover:bg-blue-800 focus:ring-4 focus:outline-none 
                       focus:ring-blue-300 font-medium rounded-sm text-sm px-4 py-2 
                       dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          >
            Search
          </button>
        </div>
      </form>

      {/* 검색 결과 리스트 */}
      {!loading && (    <div className="">
        <GroupList groups={result} />
      </div>)}
      {loading && (
        <div className="mt-4"><LoadAnimation /></div>)}
    </div>
  );
};

export default SearchGroup;
