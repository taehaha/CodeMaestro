// eslint-disable-next-line no-unused-vars
import React from "react";
import PropTypes from "prop-types";
import { AchievementList } from "../../utils/AchievementList";

// 예시 아이콘
import { FaMedal, FaGem, FaCheckCircle } from "react-icons/fa";

// 등급별 아이콘
const tierIcons = {
  bronze: <FaMedal className="text-amber-600" />,
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
      currentStat = myAttendances;
      break;
    case "duration":
      currentStat = totalDuration;
      break;
    case "achive":
      currentStat = nonAchiveCompletedCount;
      break;
    default:
      currentStat = 0;
  }

  const rate = Math.floor((currentStat / item.condition) * 100);
  return rate > 100 ? 100 : rate;
};

const Achievement = ({ myAttendances, totalDuration }) => {
  /**
   * 1) attend/duration만 따로 계산하여
   *    '이미 달성된 과제 개수'를 구합니다.
   */
  const nonAchiveList = AchievementList.filter((a) => a.type !== "achive");
  const nonAchiveCompletedCount = nonAchiveList.reduce((count, achievement) => {
    const progress = getProgress(achievement, myAttendances, totalDuration, 0);
    return progress >= 100 ? count + 1 : count;
  }, 0);

  /**
   * 2) 전체 과제 목록에 대해,
   *    - achive형이면 (nonAchiveCompletedCount) 사용
   *    - 아니면 그대로 (myAttendances, totalDuration) 사용
   */
  let achievementMissions = 0;

  const renderList = AchievementList.map((achievement) => {
    const isAchiveType = achievement.type === "achive";
    const progress = getProgress(
      achievement,
      myAttendances,
      totalDuration,
      isAchiveType ? nonAchiveCompletedCount : 0
    );

    const isCompleted = progress >= 100;
    if (isCompleted) achievementMissions += 1;

    // 등급(티어)에 따라 아이콘
    const gradeIcon = tierIcons[achievement.value] || null;

    // 미완료(잠금) 상태라면 흐릿하게, 흑백 처리
    // const lockedClass = isCompleted
    //   ? "opacity-100 grayscale-0 border-green-400"
    //   : "opacity-60 grayscale border-gray-300";

    // 잠금 해제 시 강조 효과(테두리, 그림자 등)
    const completeGlow = isCompleted
      ? "shadow-lg shadow-green-300"
      : "shadow-none";

    return (
      <li
        key={achievement.id}
        className={`border rounded p-4 transition-all duration-300 flex flex-col gap-2${completeGlow} shadow-md`}
      >
        <div className="flex items-center justify-between">
          {/* 좌측 아이콘 & 타이틀 */}
          <div className="flex items-center gap-3">
            {/* 트로피/티어 아이콘 */}
            <div className="text-4xl">{gradeIcon}</div>

            {/* 타이틀 */}
            <span className="font-semibold text-xl">
              {achievement.title}
            </span>
          </div>

          {/* 잠금 해제 여부 표시 */}
          {isCompleted ? (
            <FaCheckCircle className="text-green-500 text-3xl" />
          ) : (
            <p className="text-lg font-medium">{progress}%</p>
          )}
        </div>

        {/* 도전과제 내용 */}
        <p className="text-gray-600 ml-1">{achievement.content}</p>

        {/* 진행도 표시(프로그레스바) */}
        <div className="bg-gray-200 h-3 rounded-full overflow-hidden mt-2">
          <div
            className="bg-green-500 h-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </li>
    );
  });

  return (
        <div className="p-4 max-w-3xl mx-auto">
        <div className="mb-6">
            <h2 className="text-lg font-bold">
            도전 과제 ({achievementMissions}/{AchievementList.length})
            </h2>
        </div>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-8 ">
            {renderList}
        </ul>
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
