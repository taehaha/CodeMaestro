import { useEffect, useState } from "react";
import LoadAnimation from "../../components/LoadAnimation";
import SearchGroup from "./SearchGroup";
import GroupList from "./GroupList";
import { FaPlus } from "react-icons/fa";
import { getMyGroupList, GroupRankingList } from "../../api/GroupApi";
import { useSelector } from "react-redux";

const GroupRankingPage = () => {
  const [groups, setGroups] = useState([]);
  const [myGroups, setMyGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("ranking");
  const [showModal, setShowModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState(""); // 에러 메시지 상태 추가

  const currentDate = new Date();
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const user = useSelector((state) => state.user.myInfo);
  const userId = user?.userId; // user가 없을 수도 있으므로 옵셔널 체이닝

  // 랭킹 그룹 가져오기
  useEffect(() => {
    if (!userId || activeTab !== "ranking") return;

    const fetchRankingGroups = async () => {
      setLoading(true);
      setErrorMessage(""); // 에러 메시지 초기화
      try {
        const rankingGroups = await GroupRankingList({ year: selectedYear, month: selectedMonth });
        if (rankingGroups.length === 0) {
          setErrorMessage("조회된 그룹이 없습니다."); // 빈 배열일 경우 메시지 표시
        }
        setGroups(rankingGroups);
      } catch (error) {
        console.error("그룹 데이터를 불러오는 중 오류 발생:", error.message);
        setGroups([]);
        setErrorMessage("해당 연도 및 월에 대한 그룹 랭킹이 없습니다."); // 400 에러 메시지 표시
      } finally {
        setLoading(false);
      }
    };

    fetchRankingGroups();
  }, [userId, activeTab, selectedYear, selectedMonth]);

  // 내 그룹 가져오기
  useEffect(() => {
    if (!userId || activeTab !== "myGroups") return;

    const fetchMyGroups = async () => {
      setLoading(true);
      setErrorMessage(""); // 에러 메시지 초기화
      try {
        const myGroupList = await getMyGroupList(userId);
        if (myGroupList.length === 0) {
          setErrorMessage("가입된 그룹이 없습니다.");
        }
        setMyGroups(myGroupList);
      } catch (error) {
        console.error("내 그룹 데이터를 불러오는 중 오류 발생:", error.message);
        setMyGroups([]);
        setErrorMessage("내 그룹을 불러오는 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchMyGroups();
  }, [userId, activeTab]);

  if (loading) {
    return <LoadAnimation />;
  }

  // 탭 전환 함수
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setErrorMessage(""); // 탭 변경 시 에러 메시지 초기화
  };

  return (
    <div className="container mx-auto p-4 shadow-xl">
      {/* 상단 헤더 */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Groups</h1>
        <button onClick={() => setShowModal(true)} className="tooltip tooltip-left" data-tip="Search Groups">
          <FaPlus size={20} />
        </button>
      </div>

      {/* 탭 메뉴 */}
      <div className="tabs">
        <button
          className={`tab tab-bordered ${activeTab === "ranking" ? "tab-active" : ""}`}
          onClick={() => handleTabChange("ranking")}
        >
          전체 그룹
        </button>
        <button
          className={`tab tab-bordered ${activeTab === "myGroups" ? "tab-active" : ""}`}
          onClick={() => handleTabChange("myGroups")}
        >
          내 그룹
        </button>
      </div>

      {/* 그룹 리스트 또는 에러 메시지 표시 */}
      <div>
        {errorMessage ? (
          <p className="text-center text-gray-500 my-4">{errorMessage}</p>
        ) : activeTab === "ranking" ? (
          <GroupList groups={groups} />
        ) : (
          <GroupList groups={myGroups} />
        )}
      </div>

      {/* SearchGroup 모달 */}
      {showModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h2 className="font-bold text-lg mb-4">Search Groups</h2>
            <SearchGroup />
            <div className="modal-action">
              <button onClick={() => setShowModal(false)} className="btn btn-sm rounded-sm">
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupRankingPage;
