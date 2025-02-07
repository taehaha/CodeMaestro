import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Doughnut } from "react-chartjs-2";
import { Chart, ArcElement, Tooltip, Legend } from "chart.js";
import { MdAccessTime } from "react-icons/md";
import dayjs from "dayjs";

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
  const hours = Math.floor(totalDuration / 60);
  const minutes = totalDuration % 60;
  const totalStudyTime = hours > 0 ? `${hours}시간 ${minutes}분` : `${minutes}분`;

  return (
    <div className="flex flex-col gap-8 p-6 bg-gray-100 rounded-sm shadow-lg w-4xl max-w-5xl mx-auto">
      {/* 상단 영역: 출석률 / 누적 참여 시간 */}
      <div className="flex flex-col lg:flex-row items-center justify-center w-full gap-8">
        {/* 출석률 차트 */}
        <div className="flex flex-col items-center">
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
        <div className="p-4 bg-white shadow-md rounded-lg w-full max-w-xs">
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

      {/* 하단 영역: 최근 참여 스터디 */}
      <div className="flex-1">
        <h2 className="text-lg font-semibold mb-4">최근 참여 스터디</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {conferenceHistory.length === 0 ? (
            <p className="text-gray-500">참여 기록이 없습니다.</p>
          ) : (
            conferenceHistory.map((history) => (
              <div key={history.id} className="card bg-white shadow-md p-4 rounded-lg">
                <div className="card-body">
                  <h3 className="card-title text-md font-medium text-gray-800">
                    스터디 ID: {history.group_conference_history_id}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    참여 시간: {history.joinTime ? dayjs(history.joinTime).format("YYYY-MM-DD HH:mm") : "미기록"}
                  </p>
                  <p className="text-gray-600 text-sm">
                    퇴장 시간: {history.leaveTime ? dayjs(history.leaveTime).format("YYYY-MM-DD HH:mm") : "미기록"}
                  </p>
                  <p className="text-gray-600 text-sm">
                    총 참여 시간: {history.duration ? `${history.duration}분` : "미기록"}
                  </p>
                </div>
              </div>
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
    duration: 52,
    createdAt: "2024-02-05T14:00:00",
  },
  {
    id: 2,
    group_conference_history_id: 102,
    user_id: 5,
    joinTime: "2024-02-03T16:00:00",
    leaveTime: "2024-02-03T17:00:00",
    duration: 60,
    createdAt: "2024-02-03T16:00:00",
  },
  {
    id: 3,
    group_conference_history_id: 103,
    user_id: 5,
    joinTime: "2024-02-01T18:00:00",
    leaveTime: "2024-02-01T19:30:00",
    duration: 90,
    createdAt: "2024-02-01T18:00:00",
  },
];

export default function GroupStudiesPage() {
  return <GroupStudies conferenceHistory={dummyData} />;
}
