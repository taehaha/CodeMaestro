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
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("ranking");
  const [errorMessage, setErrorMessage] = useState("");

  // 모달 표시 여부 상태
  const [showModal, setShowModal] = useState(false);

  // 현재 날짜를 기준으로 연도와 월을 기본값으로 설정
  const currentDate = new Date();
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);

  const user = useSelector((state) => state.user.myInfo);
  const userId = user?.userId;

  // 랭킹 그룹 조회 함수 (연도, 월은 내부 상태를 기본값으로 사용)
  const fetchRankingGroups = async (year = selectedYear, month = selectedMonth) => {
    setErrorMessage("");
    try {
      const rankingGroups = await GroupRankingList({ year, month });
      if (rankingGroups.length === 0) {
        setErrorMessage("조회된 그룹이 없습니다.");
      }
      setGroups(rankingGroups);
    } catch (error) {
      console.error("그룹 랭킹 조회 오류:", error.message);
      setErrorMessage("해당 연도 및 월에 대한 그룹 랭킹이 없습니다.");
      setGroups([]);
    } finally {
      setLoading(false);
    }
  };

  // 내 그룹 조회 함수
  const fetchMyGroups = async () => {
    setErrorMessage("");
    try {
      const myGroupList = await getMyGroupList(userId);
      if (myGroupList.length === 0) {
        setErrorMessage("가입된 그룹이 없습니다.");
      }
      setMyGroups(myGroupList);
    } catch (error) {
      console.error("내 그룹 조회 오류:", error.message);
      setErrorMessage("내 그룹을 불러오는 중 오류가 발생했습니다.");
      setMyGroups([]);
    } finally {
      setLoading(false);
    }
  };

  // activeTab, userId, 또는 연도/월 변경 시 해당 데이터를 조회
  useEffect(() => {
    if (!userId) return;
    if (activeTab === "ranking") {
      fetchRankingGroups();
    } else if (activeTab === "myGroups") {
      fetchMyGroups();
    }
  }, [activeTab, userId, selectedYear, selectedMonth]);

  if (loading) return <LoadAnimation />;

  return (
    <div className="container mx-auto p-4 shadow-md rounded-lg">
      {/* 상단 헤더 */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">그룹</h1>
        {/* FaPlus 아이콘 클릭 시 모달 열기 */}
        <button
          className="tooltip tooltip-left"
          data-tip="그룹 추가"
          onClick={() => setShowModal(true)}
        >
          <FaPlus size={20} />
        </button>
      </div>

      {/* 탭 메뉴 */}
      <div className="tab-content -mt-5">
        <div className="tab-buttons mb-4">
          <button
            onClick={() => {
              setActiveTab("ranking");
              setErrorMessage("");
            }}
            className={`tab-button ${activeTab === "ranking" ? "active" : ""}`}
          >
            전체 그룹
          </button>
          <button
            onClick={() => {
              setActiveTab("myGroups");
              setErrorMessage("");
            }}
            className={`tab-button ${activeTab === "myGroups" ? "active" : ""}`}
          >
            내 그룹
          </button>
        </div>
      </div>

      {/* 랭킹 탭일 경우 연도/월 선택 UI */}
      {activeTab === "ranking" && (
        <div className="mb-4 flex justify-center items-center gap-2">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="select select-bordered rounded-md"
          >
            {Array.from({ length: currentDate.getFullYear() - 2025 + 1 }, (_, i) => {
              const year = 2025 + i;
              return (
                <option key={year} value={year}>
                  {year}
                </option>
              );
            })}
          </select>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="select select-bordered rounded-md"
          >
            {Array.from({ length: currentDate.getMonth() + 1 }, (_, i) => {
              const month = i + 1;
              return (
                <option key={month} value={month}>
                  {month}
                </option>
              );
            })}
          </select>
          <button
            className="btn bg-[#ffcc00] hover:bg-[#f0c000] rounded-md"
            onClick={() => fetchRankingGroups()}
          >
            조회
          </button>
        </div>
      )}

      {/* 에러 메시지 */}
      {errorMessage && (
        <p className="text-center text-gray-500 my-4">{errorMessage}</p>
      )}

      {/* 그룹 리스트 표시 */}
      {activeTab === "ranking" ? (
        <GroupList groups={groups} type="ranking" />
      ) : (
        <GroupList groups={myGroups} type="myGroups" />
      )}

      {/* SearchGroup 모달 - DaisyUI 모달 사용 */}
      {showModal && (
        <div className="modal modal-open">
          <div className="modal-box relative">
            <h2 className="font-bold text-lg mb-4">그룹 추가</h2>
            <SearchGroup />
            <div className="modal-action">
              <button
                className="text-black bg-[#ddd] hover:bg-[#ccc] focus:ring-4 
                       focus:outline-none focus:ring-gray-300 font-medium 
                       rounded-md text-sm px-4 py-2"
                onClick={() => setShowModal(false)}
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

export default GroupRankingPage;
