import { useState } from "react";
import RoomList from "./RoomList";
import { useNavigate } from 'react-router-dom';
import Swal from "sweetalert2";
import SearchBar from "./SearchBar";
import FilteringBar from "./FilteringBar";

const MeetingPage = () => {
  // 더미 데이터
  const dummyMeetings = [
    {
      Id: "A6zx25",
      name: "대전컴퓨터학원 19:30",
      isPrivate: true,
      participants: 8,
      languages: ["Python", "Java"],
      tags: ["알고리즘", "스터디"],
    },
    {
      Id: "A6zxs5",
      name: "대전컴퓨터학원 고급반 19:30",
      isPrivate: true,
      participants: 8,
      languages: ["C++", "Java"],
      tags: ["알고리즘", "프로젝트"],
    },
    {
      Id: "A65z5",
      name: "파이썬  1:1 초보반",
      isPrivate: false,
      participants: 5,
      languages: ["Python"],
      tags: ["스터디"],
    },
    {
      Id: "A6zz5z",
      name: "파이썬  1:1 초보반",
      isPrivate: false,
      participants: 5,
      languages: ["Python"],
      tags: ["스터디"],
    },

    {
      Id: "A60015",
      name: "종료된 미팅 입장 테스트 : 누르면 alret 떠야함",
      isPrivate: false,
      participants: 0,
      languages: ["Java", "Spring"],
      tags: ["백엔드", "개발"],
    },
    {
      Id: "A6zzaz",
      name: "파이썬  1:4 고수반",
      isPrivate: false,
      participants: 5,
      languages: ["Python"],
      tags: ["스터디"],
    },

    {
      Id: "A60d05",
      name: "종료된 미팅",
      isPrivate: false,
      participants: 0,
      languages: ["Java", "Spring"],
      tags: ["백엔드", "개발"],
    },
  ];
  
  // const dummyMeetings2 = [
  //   {
  //     name: "대전컴퓨터학원 19:30",
  //     isPrivate: true,
  //     participants: 8,
  //     languages: ["Python", "Java"],
  //     tags: ["알고리즘", "스터디"],
  //   },
  //   {
  //     name: "종료된 미팅 입장 테스트 : 누르면 alret 떠야함",
  //     isPrivate: false,
  //     participants: 0,
  //     languages: ["Java", "Spring"],
  //     tags: ["백엔드", "개발"],
  //   },
  // ];

  // 검색어, 언어, 태그 필터링 위해 준비한 state 변수
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  
    const handleSearch = (input) => {        
      setSearchTerm(input)
  }

  const handleFilter = (type, value) => {
    // 필터링 타입에 따라 상태 관리
    if (type === "tag") {
      setSelectedTags((prev) =>
        prev.includes(value) ? prev.filter((tag) => tag !== value) : [...prev, value]
      );
    } else if (type === "language") {
      setSelectedLanguages((prev) =>
        prev.includes(value) ? prev.filter((lang) => lang !== value) : [...prev, value]
      );
    }
  };
   

  // 룸 리스트 rooms와 setRooms는 백엔드 연결 시 채우는 용도로 사용 예정
  // 우선 더미미팅
  const [rooms, setRooms] = useState(dummyMeetings)

  // 룸 들어갔을 때 테스트용 임시 반응 
    const handleEnterRoom = () =>{
      Swal.fire(
{        title: "회의실 입장",
  text: "공유받은 링크를 통해 회의에 입장할 수 있습니다.",
  input: "text", // 비밀번호 입력 필드
  showCancelButton: true,
  confirmButtonText: "확인",
  cancelButtonText: "취소",}
      ).then((result)=>{console.log("링크:", result.value);}

      )
    }

  // 검색어, 언어, 태그 필터링 적용
  // 필터링 구현방식 : 만약 검색어가 포함되어 있고, 선택된 언어 중 하나라도 포함되어 있고, 선택된 태그 중 하나라도 포함되어 있으면 보여줌
  const fillteredRooms = rooms.filter((room) => {
    const matchSearch = room.name.includes(searchTerm);
    const matchLanguage = selectedLanguages.length === 0 || room.languages.some((languages) => selectedLanguages.includes(languages));
    const matchTags = selectedTags.length === 0 || room.tags.some((tag) => selectedTags.includes(tag));

    return matchSearch && matchLanguage && matchTags;
  })

  const navigate = useNavigate();
  const handleCreateMeeting = () => {
    navigate('/create-meeting');
  };

    return(
<>
  <div className="flex justify-center bg-primaryBg  dark:bg-darkPrimaryBg min-h-screen">
    {/* 메인 콘텐츠 영역 */}
    <div className="container mx-auto">
      <div className="grid grid-cols-1 2xl:grid-cols-3 gap-6 p-4">
        {/* Left Section */}
        <div className="col-span-2">
          <h1 className="header-style text-2xl mb-4">
            Live Rooms
          </h1>
          {/* 검색, 언어, 태그 필터링 */}
          <div className="p-1 rounded-md overflow-y-auto">

            {/* 검색 */}
            <SearchBar onSearch={handleSearch} setRooms={setRooms} />
            <div className="flex flex-col">
                          {/* 언어 */}
              <FilteringBar
                items={['C++', 'Python', 'Java']}
                onFilter={(value) => handleFilter('language', value)}
                selectedItems={selectedLanguages}
              />
            {/* 태그 */}
            <FilteringBar
              items={['프로젝트', '알고리즘', '스터디']}
              onFilter={(value) => handleFilter('tag', value)}
              selectedItems={selectedTags}
            />
          </div>


            {/* 방 목록 */}
            <RoomList rooms={fillteredRooms} />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex flex-col gap-6 ">
          {/* 새로운 회의 시작 */}
          <div>
            <h1 className="header-style text-2xl">
              새로운 회의 시작
            </h1>
            <button
              className="room-card text-xl flex justify-center items-center h-[200px] w-full"
              onClick={() => handleCreateMeeting()}
            >
              +
            </button>
          </div>

          {/* 링크를 통해 입장 */}
          <div>
            <h1 className="header-style text-2xl ">
              링크를 통해 입장
            </h1>
            <button
              className="room-card flex items-center justify-center h-[200px] w-full"
              onClick={() => handleEnterRoom()}
            >
              <h1 className="text-2xl">링크로 참여하기</h1>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</>
    )
}



export default MeetingPage