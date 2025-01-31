import { useEffect, useState } from "react"
import UserAxios from "../../api/userAxios"
import LoadAnimation from "../../components/LoadAnimation"
import SearchGroup from "./SearchGroup";
import GroupList from "./GroupList";
import { FaPlus } from "react-icons/fa";


const GroupRankingPage = () => {
    const [groups, setGroups] = useState([])
    const [myGroups, setMyGroups] = useState([])
    const [loading, setLoading] = useState(true); // 로딩 상태에러
    const [activeTab, setActiveTab] = useState("ranking"); // 현재 활성 탭
    const [showModal, setShowModal] = useState(false)
    // 랭킹 그룹 가져오기
    const getGroupList = async () => {
        try {
            const response = await UserAxios.get('/groups/',{
                params:{
                    sort:"rank",
                    limit:10,
                    friends:false
                }
            })
    
            return [{groupId:"12",name:"더미랭킹그룹1", groupImage:'/test_profile.png', groupRanking:1, points:9999},
              {groupId:"13",name:"더미랭킹그룹2", groupImage:'/test_profile.png', groupRanking:2, points:9998},
              {groupId:"14",name:"더미랭킹그룹1", groupImage:'/test_profile.png', groupRanking:1, points:9999},
              {groupId:"15",name:"더미랭킹그룹2", groupImage:'/test_profile.png', groupRanking:2, points:9998},
              {groupId:"16",name:"더미랭킹그룹1", groupImage:'/test_profile.png', groupRanking:1, points:9999},
              {groupId:"17",name:"더미랭킹그룹2", groupImage:'/test_profile.png', groupRanking:2, points:9998},
          ]
        } catch (error) {
            console.error("랭킹 불러오는 중 오류 발생", error);
            return [{groupId:"12",name:"더미랭킹그룹1", groupImage:'/test_profile.png', groupRanking:1, points:9999},
                {groupId:"13",name:"더미랭킹그룹2", groupImage:'/test_profile.png', groupRanking:2, points:9998},
                {groupId:"14",name:"더미랭킹그룹1", groupImage:'/test_profile.png', groupRanking:1, points:9999},
                {groupId:"15",name:"더미랭킹그룹2", groupImage:'/test_profile.png', groupRanking:2, points:9998},
                {groupId:"16",name:"더미랭킹그룹1", groupImage:'/test_profile.png', groupRanking:1, points:9999},
                {groupId:"17",name:"더미랭킹그룹2", groupImage:'/test_profile.png', groupRanking:2, points:9998},
            ]
        }
    }
    // 내 그룹 가져오기

    const getMyGroupList = async () => {
        try {
            const response = await UserAxios.get('/groups/',{
                params:{friends:true}
            })
    
            // return response.data // 연결되면 ㄱㄱ
            return [{name:"더미내그룹", groupImage:'/test_profile.png', groupRanking:1235, points:2345}]
        } catch (error) {
            console.error("내 그룹 불러오는 중 오류 발생",error);
            return [{name:"더미내그룹", groupImage:'/test_profile.png', groupRanking:1235, points:2345}]
        }
    }

// useEffect로 데이터 로드
useEffect(() => {
    const fetchGroups = async () => {
      try {
        // 로딩 시작
        setLoading(true);

        // 모든 그룹 & 내 그룹 데이터 요청 병렬 처리
        const [groupData, myGroupData] = await Promise.all([
          getGroupList(),
          getMyGroupList(),
        ]);

        // 상태 업데이트
        setGroups(groupData);
        setMyGroups(myGroupData);
      } catch (err) {
        // 에러 처리
        console.error(err.message);
      } finally {
        // 로딩 종료
        setLoading(false);
      }
    };

    fetchGroups();
  }, []); // 빈 배열 의존성: 페이지 로드 시 한 번 실행

  if (loading) {
    return (
        <>
        <LoadAnimation />
        </>
    );
  }


  // 랭킹 : 내 친구 탭 전환
    const handleTabChange = (tab) => {
        setActiveTab(tab);
    };

    return (
        <div className="container mx-auto p-4">
          {/* 상단 헤더 */}
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">Groups</h1>
            <button
              onClick={() => setShowModal(true)}
              className="tooltip tooltip-left"
              data-tip="Search Groups"
            >
              <FaPlus size={20} />
            </button>
          </div>
    
          {/* 탭 메뉴 */}
          <div className="tabs">
            <button
              className={`tab tab-bordered ${
                activeTab === "ranking" ? "tab-active" : ""
              }`}
              onClick={() => handleTabChange("ranking")}
            >
              랭킹
            </button>
            <button
              className={`tab tab-bordered ${
                activeTab === "myGroups" ? "tab-active" : ""
              }`}
              onClick={() => handleTabChange("myGroups")}
            >
              내 그룹
            </button>
          </div>
    
          {/* 그룹 리스트 */}
          <div>
            {activeTab === "ranking" && <GroupList groups={groups} />}
            {activeTab === "myGroups" && <GroupList groups={myGroups} />}
          </div>
    
          {/* SearchGroup 모달 */}
{/* SearchGroup 모달 */}
{showModal && (
  <div className="modal modal-open">
    <div className="modal-box">
      <h2 className="font-bold text-lg mb-4">Search Groups</h2>
      <SearchGroup />
      <div className="modal-action">
        <button
          onClick={() => setShowModal(false)} // 닫기 버튼 동작
          className="btn btn-sm rounded-sm"
        >
          닫기
        </button>
      </div>
    </div>
  </div>
)}

        </div>
      );
};

export default GroupRankingPage