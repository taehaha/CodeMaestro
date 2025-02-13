import React from "react";
import PropTypes from "prop-types";
import { AchievementList } from "../../utils/AchievementList";

// 아이콘 예시
import { FaMedal, FaGem, FaCheckCircle } from "react-icons/fa";

// 등급별 아이콘 (원하는 대로 변경)
const tierIcons = {
  bronze: <FaMedal style={{ color: "chocolate" }} />,
  silver: <FaMedal style={{ color: "silver" }} />,
  gold: <FaMedal style={{ color: "gold" }} />,
  platinum: <FaMedal style={{ color: "royalblue" }} />,
  diamond: <FaGem style={{ color: "deepskyblue" }} />,
};

/**
 * 개별 도전 과제의 진행률(%)을 계산하는 함수
 * @param item AchievementList 내의 과제 정보
 * @param myAttendances 내 출석 횟수
 * @param totalDuration 내 누적 시간(초)
 * @param nonAchiveCompletedCount 이미 달성된 (attend/duration) 과제 수
 */
const getProgress = (item, myAttendances, totalDuration, nonAchiveCompletedCount) => {
  let currentStat = 0;
  switch (item.type) {
    case "attend":
      // 출석형 과제 → 출석 횟수 기반
      currentStat = myAttendances;
      break;
    case "duration":
      // 누적시간형 과제 → 누적 시간(초) 기반
      currentStat = totalDuration;
      break;
    case "achive":
      // achive형 과제 → (attend/duration 으로) 이미 달성된 과제 개수 사용
      currentStat = nonAchiveCompletedCount;
      break;
    default:
      currentStat = 0;
  }

  // 진행률(%) 계산
  const rate = Math.floor((currentStat / item.condition) * 100);
  return rate > 100 ? 100 : rate;
};

const Achievement = ({ myAttendances, totalDuration }) => {
  /**
   * 1) 먼저 attend/duration만 따로 계산하여
   *    '이미 달성된 과제 개수'를 구합니다.
   */
  // 1-1) attend/duration만 뽑아오기
  const nonAchiveList = AchievementList.filter((a) => a.type !== "achive");

  // 1-2) 해당 과제들의 진행률 계산, progress >= 10 이면 "달성" 처리
  const nonAchiveCompletedCount = nonAchiveList.reduce((count, achievement) => {
    const progress = getProgress(achievement, myAttendances, totalDuration, 0);
    return progress >= 100 ? count + 1 : count;
  }, 0);

  /**
   * 2) 전체 과제 목록을 화면에 표시.
   *    - 단, achive형일 때는 (nonAchiveCompletedCount)를 건네서 progress 계산
   *    - attend/duration형은 그냥 myAttendances, totalDuration만 사용
   */
  // 최종적으로 몇 개를 달성했는지 집계 (achive 포함)
  let achievementMissions = 0;

  const renderList = AchievementList.map((achievement) => {
    // achive형이면 nonAchiveCompletedCount 활용
    const isAchiveType = achievement.type === "achive";

    const progress = getProgress(
      achievement,
      myAttendances,
      totalDuration,
      isAchiveType ? nonAchiveCompletedCount : 0
    );

    const isCompleted = progress >= 100;
    if (isCompleted) achievementMissions += 1;

    const gradeIcon = tierIcons[achievement.value] || null;

    return (
      <li
        key={achievement.id}
        className="bg-white shadow-md rounded p-3 flex flex-col gap-2"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-2xl">
            {gradeIcon}
            <span className="font-semibold text-gray-800 text-xl">
              {achievement.title}
            </span>
          </div>
          {isCompleted ? (
            <FaCheckCircle className="text-green-500 text-4xl my-auto" />
          ) : (
            <p className="text-xl">{progress}%</p>
          )}
        </div>
        <p className="text-xl text-gray-500">{achievement.content}</p>
      </li>
    );
  });

  return (
    <div className="p-4">
      <ul className="space-y-4">{renderList}</ul>
    </div>
  );
};

Achievement.propTypes = {
  /** 내 출석 횟수 */
  myAttendances: PropTypes.number.isRequired,
  /** 내 누적 시간(초 단위) */
  totalDuration: PropTypes.number.isRequired,
};

export default Achievement;
