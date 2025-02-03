import { useEffect, useState } from "react"
import UserAxios from "../../api/userAxios"
import LoadAnimation from "../../components/LoadAnimation"
import SearchGroup from "./SearchGroup";
import GroupList from "./GroupList";
import { FaPlus } from "react-icons/fa";
import { getMyGroupList, getGroupList } from "../../api/GroupApi";
import { useSelector } from "react-redux";

const GroupRankingPage = () => {
    const [groups, setGroups] = useState([])
    const [myGroups, setMyGroups] = useState([])
    const [loading, setLoading] = useState(true); // 로딩 상태에러
    const [activeTab, setActiveTab] = useState("ranking"); // 현재 활성 탭
    const [showModal, setShowModal] = useState(false)
    const user = useSelector((state) => state.user.myInfo);
    const userId = user.userId
    
    // 랭킹 그룹 가져오기

// useEffect로 데이터 로드
useEffect(() => {
  const fetchGroups = async () => {
    try {
      // 로딩 시작
      setLoading(true);

      // 두 API를 병렬로 호출
      const [rankingGroups, myGroupList] = await Promise.all([
        getGroupList(),         // 랭킹 그룹 API (쿼리 파라미터로 정렬, 제한, 친구 여부 전달)
        getMyGroupList(userId),   // 내 그룹 API (userId를 파라미터로 전달)
      ]);

      // 상태 업데이트
      setGroups(rankingGroups);
      setMyGroups(myGroupList);
    } catch (error) {
      console.error("그룹 데이터를 불러오는 중 오류 발생:", error.message);
    } finally {
      // 로딩 종료
      setLoading(false);
    }
  };

  // userId가 존재할 때만 API 호출
  if (userId) {
    fetchGroups();
  }
}, [userId]);
// 빈 배열 의존성: 페이지 로드 시 한 번 실행

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
              전체 그룹
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