import { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";
import { MdAddCircle } from "react-icons/md";

import RoomList from "./RoomList";
import SearchBar from "../../components/SearchBar";
import GroupRankingPage from "../Group/GroupRankingPage";
import LoadAnimation from "../../components/LoadAnimation";
import { getRoomList } from "../../api/RoomApi";

const MeetingPage = () => {
  // 더미 데이터
  // const dummyMeetings = [
  //   {
  //     id: 1,
  //     owner_id: 101,
  //     thumbnail_url: "https://placehold.co/150",
  //     title: "대전컴퓨터학원 19:30",
  //     description: "알고리즘 스터디",
  //     is_active: 1, // 1이면 활성, 0이면 종료
  //     url: "A6zx25", 
  //     entry_password: "secret123", // 있으면 비밀방
  //     language: "Python",
  //     participants: 8,
  //     tags: ["알고리즘", "스터디"],
  //   },
  //   {
  //     id: 2,
  //     owner_id: 102,
  //     thumbnail_url: "https://placehold.co/150",
  //     title: "대전컴퓨터학원 고급반 19:30",
  //     description: "고급 알고리즘 강의",
  //     is_active: 1,
  //     url: "A6zxs5",
  //     entry_password: "abc1234",
  //     language: "Java",
  //     participants: 8,
  //     tags: ["알고리즘", "강의"],
  //   },
  //   {
  //     id: 3,
  //     owner_id: 103,
  //     thumbnail_url: "https://placehold.co/150",
  //     title: "파이썬 1:1 초보반",
  //     description: "1:1 지도를 위한 오픈방",
  //     is_active: 1,
  //     url: "A65z5",
  //     entry_password: null, // null이면 오픈방
  //     language: "Python",
  //     participants: 5,
  //     tags: ["스터디"],
  //   },
  //   {
  //     id: 4,
  //     owner_id: 103,
  //     thumbnail_url: "https://placehold.co/150",
  //     title: "파이썬 1:1 초보반 (2)",
  //     description: "반복 학습용",
  //     is_active: 1,
  //     url: "A6zz5z",
  //     entry_password: null,
  //     language: "Python",
  //     participants: 5,
  //     tags: ["스터디"],
  //   },
  //   {
  //     id: 5,
  //     owner_id: 104,
  //     thumbnail_url: "https://placehold.co/150",
  //     title: "종료된 미팅 입장 테스트",
  //     description: "이미 종료된 방",
  //     is_active: 0, // 종료
  //     url: "A60015",
  //     entry_password: null,
  //     language: "Java",
  //     participants: 0,
  //     tags: ["백엔드", "강의"],
  //   },
  //   {
  //     id: 6,
  //     owner_id: 105,
  //     thumbnail_url: "https://placehold.co/150",
  //     title: "파이썬 1:4 고수반",
  //     description: "파이썬 심화 내용",
  //     is_active: 1,
  //     url: "A6zzaz",
  //     entry_password: null,
  //     language: "Python",
  //     participants: 5,
  //     tags: ["스터디"],
  //   },
  //   {
  //     id: 7,
  //     owner_id: 105,
  //     thumbnail_url: "https://placehold.co/150",
  //     title: "종료된 미팅",
  //     description: "더 이상 참여 불가",
  //     is_active: 0,
  //     url: "A60d05",
  //     entry_password: null,
  //     language: "Spring", 
  //     participants: 0,
  //     tags: ["강의", "개발"],
  //   },
  // ];
  
  // 검색어, 언어, 태그 필터링 위해 준비한 state 변수
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [rooms, setRooms] = useState([]);

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
    console.log(room);
    
    const matchSearch = room.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchSearch ;
  });

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