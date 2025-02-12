import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Doughnut } from "react-chartjs-2";
import { Chart, ArcElement, Tooltip, Legend } from "chart.js";
import { MdAccessTime } from "react-icons/md";
import StudyHistoryCard from "./StudyHistoryCard";
Chart.register(ArcElement, Tooltip, Legend);

const GroupStudies = ({ conferenceHistory }) => {
  // 전체 회의 수 vs 내 참석 횟수
  const totalMeetings = 4;
  const myAttendances = conferenceHistory.length;

  // 출석률 애니메이션
  const [attendanceRate, setAttendanceRate] = useState(0);
  const targetRate = Math.round((myAttendances / totalMeetings) * 100);

  useEffect(() => {
    let currentRate = 0;
    const interval = setInterval(() => {
      currentRate += 1;
      if (currentRate > targetRate) {
        clearInterval(interval);
      } else {
        setAttendanceRate(currentRate);
      }
    }, 25);
    return () => clearInterval(interval);
  }, [targetRate]);

  // Doughnut 차트 데이터
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

  // 누적 참여 시간 계산 (단위: 분)
  const totalDuration = conferenceHistory.reduce((acc, record) => acc + (record.duration || 0), 0);
  const  formatDuration= (seconds)=> {
    if (seconds <= 0) return "0초";
  
    const hours = Math.floor(seconds / 3600);
    const remainder = seconds % 3600;
    const minutes = Math.floor(remainder / 60);
    const secs = remainder % 60;
  
    let result = "";
    if (hours > 0) result += `${hours}시간 `;
    if (minutes > 0) result += `${minutes}분 `;
    if (secs > 0) result += `${secs}초`;
  
    return result.trim();
  }
  const totalStudyTime = formatDuration(totalDuration);

  return (
    <div className="flex flex-col lg:flex-row gap-8 p-6 w-4xl">
      {/* 왼쪽 섹션 (차트, 누적시간 카드) */}
      <div className="flex flex-col gap-8 w-full lg:w-1/3 my-auto">
        {/* 출석률 차트 */}
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

        {/* 누적 참여 시간 카드 */}
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

      {/* 오른쪽 섹션 (회색 박스, 참여 기록) */}
      <div
        className="
          flex-1
          bg-gray-100 
          rounded-sm 
          shadow-lg 
          p-6 
          overflow-y-auto 
          max-h-[600px]
        "
      >
        <h2 className="text-lg font-semibold mb-4">최근 참여 스터디</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {conferenceHistory.length === 0 ? (
            <p className="text-gray-500">참여 기록이 없습니다.</p>
          ) : (
            conferenceHistory.map((history) => (
              <StudyHistoryCard key={history.id} history={history} formatDuration={formatDuration} />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

GroupStudies.propTypes = {
  conferenceHistory: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      group_conference_history_id: PropTypes.number.isRequired,
      user_id: PropTypes.number.isRequired,
      joinTime: PropTypes.string,
      leaveTime: PropTypes.string,
      duration: PropTypes.number,
      createdAt: PropTypes.string.isRequired,
    })
  ).isRequired,
};

// 테스트용 더미 데이터
const dummyData = [
  {
    id: 1,
    group_conference_history_id: 101,
    user_id: 5,
    joinTime: "2024-02-05T14:00:00",
    leaveTime: "2024-02-05T15:30:00",
    duration: 5200,
    createdAt: "2024-02-05T14:00:00",
  },
  {
    id: 2,
    group_conference_history_id: 102,
    user_id: 5,
    joinTime: "2024-02-03T16:00:00",
    leaveTime: "2024-02-03T17:00:00",
    duration: 3600,
    createdAt: "2024-02-03T16:00:00",
  },
  {
    id: 3,
    group_conference_history_id: 103,
    user_id: 5,
    joinTime: "2024-02-01T18:00:00",
    leaveTime: "2024-02-01T19:30:00",
    duration: 5400,
    createdAt: "2024-02-01T18:00:00",
  },
];

export default function GroupStudiesPage() {
  return <GroupStudies conferenceHistory={dummyData} />;
}
