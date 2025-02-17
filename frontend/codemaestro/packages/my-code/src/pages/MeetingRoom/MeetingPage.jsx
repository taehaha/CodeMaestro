import { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";
import { MdAddCircle } from "react-icons/md";

import RoomList from "./RoomList";
import SearchBar from "../../components/SearchBar";
import GroupRankingPage from "../Group/GroupRankingPage";
import LoadAnimation from "../../components/LoadAnimation";
import { getRoomList } from "../../api/RoomApi";
import TagList from "./TagList";

const MeetingPage = () => {  
  // 검색어, 언어, 태그 필터링 위해 준비한 state 변수
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [searchTags, setSearchTags] = useState([])

  const handleSearch = (input) => {
    setSearchTerm(input);
  };

  const getMeetingRooms = async () => {
    try {
      setIsLoading(true);
      const result = await getRoomList();
      setRooms(result);
    } catch (error) {
      console.error("미팅 목록 불러오기 중 에러 발생.", error);
      setRooms([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(()=>{
    getMeetingRooms()
  },[])

const fillteredRooms = rooms.filter((room) => {
  if (!room) {
    return
  }

  // 1. 검색어 매칭 (title)
  const matchSearch = room.title.toLowerCase().includes(searchTerm.toLowerCase());
  // 2. 태그 매칭 (room.TagNameList가 searchTags에 포함된 태그를 가진 경우)
  const matchTags = searchTags.every(tag => room.tagNameList?.includes(tag));
  return matchSearch && matchTags;
  });

  const selectTag = (tag) =>{
    console.log(tag);
    setSearchTags((prevTags) => {
      // 태그가 이미 searchTags에 있다면 제거, 없으면 추가
      if (prevTags.includes(tag)) {
        return prevTags.filter((exist) => exist !== tag);
      } else {
        return [...prevTags, tag];
      }
    });

  }

  const navigate = useNavigate();
  const handleCreateMeeting = () => {
    navigate("/create-meeting");
  };

  return (
    <>
      <div className="flex justify-center bg-primaryBg dark:bg-darkPrimaryBg min-h-screen">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 p-4">
            {/* Left Section */}
            <div className="flex flex-col gap-6 mx-auto w-96">
              <div>
                <GroupRankingPage />
              </div>
              <div></div>
            </div>

            {/* Right Section */}
            <div className="col-span-2">
              <h1 className="header-style text-2xl mb-4">스터디</h1>
              <div className="p-1 rounded-md overflow-y-auto">
              <SearchBar onSearch={handleSearch} onRefresh={getMeetingRooms} setRooms={setRooms} />
                <div className="flex flex-row">
                  {/* 🔹 회의 만들기 버튼 (고정 위치) */}
                  <TagList rooms={rooms} selectTag={selectTag}></TagList>
                  <button
                    onClick={handleCreateMeeting}
                    className="btn bg-[#ffcc00] dark:bg-darkHighlight btn-sm rounded-md flex items-center hover:bg-[#f0c000] ml-auto mr-14 mt-2"
                  >
                    <MdAddCircle size={24} />
                    스터디 만들기
                  </button>
                </div>
                {isLoading && <LoadAnimation />}
                {!isLoading && <RoomList rooms={fillteredRooms} />}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 🔹 회의 만들기 버튼 (고정 위치) */}
      <button
        onClick={handleCreateMeeting}
        className="btn btn-primary dark:bg-darkHighlight btn-lg fixed bottom-6 right-6 shadow-lg rounded-full flex items-center gap-2"
      >
        <MdAddCircle size={24} />
        스터디 열기
      </button>
    </>
  );
};

export default MeetingPage;