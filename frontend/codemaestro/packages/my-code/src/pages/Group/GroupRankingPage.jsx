import { useEffect, useState } from "react";
import LoadAnimation from "../../components/LoadAnimation";
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

  // 현재 날짜를 기준으로 연도와 월을 기본값으로 설정
  const currentDate = new Date();
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);

  const user = useSelector((state) => state.user.myInfo);
  const userId = user?.userId;

  // 랭킹 그룹 조회 함수 (연도, 월은 내부 상태를 기본값으로 사용)
  const fetchRankingGroups = async (year = selectedYear, month = selectedMonth) => {
    setLoading(true);
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
    setLoading(true);
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
    <div className="container mx-auto p-4 shadow-xl">
      {/* 상단 헤더 */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Groups</h1>
        <button className="tooltip tooltip-left" data-tip="Search Groups">
          <FaPlus size={20} />
        </button>
      </div>

      {/* 탭 메뉴 */}
      <div className="tabs">
        <button
          className={`tab tab-bordered ${activeTab === "ranking" ? "tab-active" : ""}`}
          onClick={() => {
            setActiveTab("ranking");
            setErrorMessage("");
          }}
        >
          전체 그룹
        </button>
        <button
          className={`tab tab-bordered ${activeTab === "myGroups" ? "tab-active" : ""}`}
          onClick={() => {
            setActiveTab("myGroups");
            setErrorMessage("");
          }}
        >
          내 그룹
        </button>
      </div>

      {/* 랭킹 탭일 경우 연도/월 선택 UI */}

      

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
      {activeTab === "ranking" && (
        <div className="mb-4 flex justify-center items-center gap-2">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="select select-bordered rounded-sm"
          >
            {Array.from({ length: 10 }, (_, i) => {
              const year = new Date().getFullYear() - i;
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
            className="select select-bordered rounded-sm"
          >
            {Array.from({ length: 12 }, (_, i) => {
              const month = i + 1;
              return (
                <option key={month} value={month}>
                  {month}
                </option>
              );
            })}
          </select>
          <button className="btn btn-primary rounded-sm" onClick={() => fetchRankingGroups()}>
            조회
          </button>
        </div>
      )}
    </div>
  );
};

export default GroupRankingPage;
