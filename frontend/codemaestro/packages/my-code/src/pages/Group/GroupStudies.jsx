import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Doughnut } from "react-chartjs-2";
import { Chart, ArcElement, Tooltip, Legend } from "chart.js";
import { MdAccessTime } from "react-icons/md";
import StudyHistoryCard from "./StudyHistoryCard";
import MemoModal from "./MemoModal";
import { CreateMemo, GetGroupHistory } from "../../api/HistoyApi";

Chart.register(ArcElement, Tooltip, Legend);

const GroupStudies = ({ groupId }) => {
  // 1) 그룹 히스토리 상태
  const [conferenceHistory, setConferenceHistory] = useState({
    totalConfrences: 0,
    participations: [],
  });

  // 2) groupId가 변할 때만 fetchHistory 실행
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const result = await GetGroupHistory(groupId);
        // 서버 응답 형태 예시: { totalConfrences: number, participations: [] }
        setConferenceHistory(result);
      } catch (error) {
        console.error("그룹 히스토리 불러오기 오류:", error);
        setConferenceHistory({ totalConfrences: 0, participations: [] });
      }
    };

    if (groupId) {
      fetchHistory();
    }
  }, [groupId]); // <-- 여기서 conferenceHistory를 제거하고, groupId만 의존성으로

  // 3) 출석률 계산
  const totalMeetings = conferenceHistory.totalConfrences || 0;
  const myAttendances = conferenceHistory.participations?.length || 0;
  const [attendanceRate, setAttendanceRate] = useState(0);
  const targetRate = totalMeetings > 0
    ? Math.round((myAttendances / totalMeetings) * 100)
    : 0;

  // 4) 출석률 애니메이션
  useEffect(() => {
    let currentRate = 0;
    const interval = setInterval(() => {
      currentRate++;
      if (currentRate > targetRate) {
        clearInterval(interval);
      } else {
        setAttendanceRate(currentRate);
      }
    }, 25);

    return () => clearInterval(interval);
  }, [targetRate]);

  // 5) 차트 데이터
  const data = {
    labels: ["출석", "결석"],
    datasets: [
      {
        data: [attendanceRate, 100 - attendanceRate],
        backgroundColor: ["#3498db", "#e0e0e0"],
        hoverBackgroundColor: ["#2980b9", "#bdbdbd"],
        borderWidth: 0,
      },
    ],
  };
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "65%",
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false },
    },
  };

  // 6) 누적 참여 시간 계산
  const totalDuration = (conferenceHistory.participations || []).reduce(
    (acc, record) => acc + (record.duration || 0),
    0
  );

  const formatDuration = (seconds) => {
    if (!seconds || seconds <= 0) return "0초";
    const hours = Math.floor(seconds / 3600);
    const remainder = seconds % 3600;
    const minutes = Math.floor(remainder / 60);
    const secs = remainder % 60;

    let result = "";
    if (hours > 0) result += `${hours}시간 `;
    if (minutes > 0) result += `${minutes}분 `;
    if (secs > 0) result += `${secs}초`;
    return result.trim();
  };

  const totalStudyTime = formatDuration(totalDuration);

  // 7) 메모 모달
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const toggleModal = (historyId) => {
    setSelectedId(historyId);
    setIsOpenModal((prev) => !prev);
  };

  // 8) 메모 작성 API
  const handleCreateMemo = async (payload) => {
    try {
      await CreateMemo({
        historyId: payload.historyId,
        studyContent: payload.studyContent,
      });
      // 모달 닫고 새로고침
      toggleModal(payload.historyId);
      window.location.reload();
    } catch (error) {
      console.error("메모 생성 중 오류 발생:", error);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 p-6 w-4xl">
      {/* 왼쪽 섹션: 출석률, 누적 시간 */}
      <div className="flex flex-col gap-8 w-full lg:w-1/3 my-auto">
        <div className="p-4 bg-white shadow-md rounded-lg flex flex-col items-center">
          <h2 className="text-lg font-semibold mb-4">내 출석률</h2>
          <div className="relative w-40 h-40">
            <Doughnut data={data} options={options} />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-700 text-lg font-bold">
              <span>출석률</span>
              <span>{attendanceRate}%</span>
            </div>
          </div>
        </div>
        <div className="p-4 bg-white shadow-md rounded-lg">
          <div className="flex items-center">
            <MdAccessTime className="w-6 h-6 text-blue-500 mr-2" />
            <h3 className="text-lg font-semibold text-gray-800">총 누적 참여 시간</h3>
          </div>
          <div className="mt-2">
            <p className="text-2xl font-bold text-blue-600">{totalStudyTime}</p>
            <p className="text-sm text-gray-500 mt-1">지난 스터디 전체 참여 누적</p>
          </div>
        </div>
      </div>

      {/* 오른쪽 섹션: 참여 기록 */}
      <div className="flex-1 bg-gray-100 rounded-sm shadow-lg p-6 overflow-y-auto max-h-[600px]">
        <h2 className="text-lg font-semibold mb-4">최근 참여 스터디</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {conferenceHistory.participations?.length > 0 ? (
            conferenceHistory.participations.map((history) => (
              <StudyHistoryCard
                key={history.id}
                history={history}
                formatDuration={formatDuration}
                // 여기서 함수를 넘겨야 합니다. 즉, 클릭 시 실행되도록 콜백을 전달
                toggleModal={() => toggleModal(history.id)}
              />
            ))
          ) : (
            <p className="text-gray-500">참여 기록이 없습니다.</p>
          )}
        </div>
      </div>

      {/* 메모 모달 */}
      {isOpenModal && (
        <MemoModal
          onCreate={handleCreateMemo}
          onClose={() => setIsOpenModal(false)}
          historyId={selectedId}
        />
      )}
    </div>
  );
};

GroupStudies.propTypes = {
  groupId: PropTypes.number,
};

export default GroupStudies;
