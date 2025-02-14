import React, { useMemo } from "react";
import PropTypes from "prop-types";
// 아이콘들
import { IoCloseCircleSharp } from "react-icons/io5";
import { FaCheckCircle, FaMinusCircle } from "react-icons/fa";

// tailwind css의 tooltip(또는 daisyUI)을 사용한다고 가정한 예시
// tooltip 사용 시, 아래 data-tip 속성을 통해 간단히 툴팁을 표시할 수 있습니다.

function GroupStric({ userId, groupStric }) {
  // 아직 groupStric이 안 불려왔다면 null 처리
  if (!groupStric) return null;

  const { memberAttendance, recentConferences } = groupStric;

  // 현재 userId와 매칭되는 attendance 데이터 찾기
  const userAttendance = memberAttendance.find(
    (member) => member.userId === userId
  );

  // 해당 유저 정보가 없으면 null 처리
  if (!userAttendance) return null;

  // [true, false, ... ] 형태로 전달받은 최근 출석 여부
  // 길이가 5 이하일 수도 있고, 5 이상일 수도 있으므로 slice(0, 5) 사용 예시
  const attendanceArray = userAttendance.attendanceStatus.slice(0, 5);

  // 회의 정보도 최대 5개만 사용(날짜 툴팁을 위해)
  const conferences = recentConferences.slice(0, 5);

  // 최대 5개의 아이콘을 뿌려주기 위한 배열 생성
  const MAX_COUNT = 5;

  const iconList = useMemo(() => {
    const icons = [];

    for (let i = 0; i < MAX_COUNT; i++) {
      // 현재 i번째 출석 정보
      const hasStatus = i < attendanceArray.length;
      // 현재 i번째 회의 정보
      const hasConference = i < conferences.length;

      if (hasStatus) {
        // 출석 여부
        const attended = attendanceArray[i];
        // 해당 회의 날짜 (YYYY-MM-DD만 보여주려면 slice(0,10))
        const tooltipText = hasConference
          ? conferences[i].startTime.slice(0, 10)
          : "날짜 정보 없음";

        if (attended) {
          // 출석(true) 아이콘
          icons.push(
            <div
              className="tooltip text-green-500"
              data-tip={tooltipText}
              key={i}
            >
              <FaCheckCircle size={28} />
            </div>
          );
        } else {
          // 결석(false) 아이콘
          icons.push(
            <div
              className="tooltip text-red-500"
              data-tip={tooltipText}
              key={i}
            >
            <FaMinusCircle size={28} />            </div>
          );
        }
      } else {
        // 회의 기록이 없는 경우(혹은 attendanceStatus가 5개 미만인 경우)
        icons.push(
          <div
            className="tooltip text-gray-400"
            data-tip="그룹 스터디를 진행하여 기록을 채워보세요!"
            key={i}
          >
            <FaMinusCircle size={28} />
          </div>
        );
      }
    }

    return icons;
  }, [attendanceArray, conferences]);

  return (
    <div className="flex gap-2">
      {iconList}
    </div>
  );
}


GroupStric.propTypes = {
  userId: PropTypes.string.isRequired,
  groupStric: PropTypes.shape({
    memberAttendance: PropTypes.arrayOf(
      PropTypes.shape({
        userId: PropTypes.string.isRequired,
        attendanceStatus: PropTypes.arrayOf(PropTypes.bool).isRequired,
      })
    ).isRequired,
    recentConferences: PropTypes.arrayOf(
      PropTypes.shape({
        startTime: PropTypes.string.isRequired,
      })
    ).isRequired,
  }),
};

export default GroupStric;

