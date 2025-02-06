import { useEffect, useState } from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart, ArcElement, Tooltip, Legend } from "chart.js";
import dayjs from "dayjs"; // 날짜 변환을 위한 라이브러리

Chart.register(ArcElement, Tooltip, Legend);

const GroupStudies = ({ conferenceHistory }) => {
  // 출석률 계산을 위한 데이터 (테스트용)
  const totalMeetings = 4; // 전체 회의 횟수
  const myAttendances = conferenceHistory.length; // 실제 참여한 횟수

  const [attendanceRate, setAttendanceRate] = useState(0); // 0%부터 시작

  // 목표 출석률 계산
  const targetRate = Math.round((myAttendances / totalMeetings) * 100);

  // 애니메이션 효과: 출석률이 0%에서 targetRate까지 증가
  useEffect(() => {
    let currentRate = 0;
    const interval = setInterval(() => {
      currentRate += 1;
      if (currentRate > targetRate) {
        clearInterval(interval);
      } else {
        setAttendanceRate(currentRate);
      }
    }, 25); // 25ms마다 증가 (속도 조절 가능)

    return () => clearInterval(interval);
  }, [targetRate]);

  // 차트 데이터 설정
  const data = {
    labels: ["출석", "결석"],
    datasets: [
      {
        data: [attendanceRate, 100 - attendanceRate], // 출석률 vs 결석률
        backgroundColor: ["#3498db", "#e0e0e0"], // 파란색 & 회색
        hoverBackgroundColor: ["#2980b9", "#bdbdbd"],
        borderWidth: 0, // 경계선 없앰
      },
    ],
  };

  // 차트 옵션 설정
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "65%", // 도넛 크기 설정
    plugins: {
      legend: { display: false }, // 범례 숨김
      tooltip: { enabled: false }, // 툴팁 숨김
    },
  };

  return (
    <div className="flex flex-col lg:flex-row justify-center items-center gap-8 p-6 bg-gray-100 rounded-lg shadow-lg w-full max-w-5xl mx-auto">
      {/* 왼쪽: 출석률 차트 */}
      <div className="flex flex-col items-center">
        <h2 className="text-lg font-semibold mb-4">내 출석률</h2>
        <div className="relative w-40 h-40">
          <Doughnut data={data} options={options} />
          {/* 중앙 텍스트 */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-700 text-lg font-bold">
            <span>출석률</span>
            <span>{attendanceRate}%</span>
          </div>
        </div>
      </div>

      {/* 오른쪽: 최근 스터디 참여 기록 */}
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

// ✅ 더미 데이터 테스트
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

// 📌 컴포넌트 실행
export default function GroupStudiesPage() {
  return <GroupStudies conferenceHistory={dummyData} />;
}
