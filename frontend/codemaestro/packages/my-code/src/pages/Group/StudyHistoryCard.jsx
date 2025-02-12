import PropTypes from "prop-types";
import dayjs from "dayjs";
import { useState } from "react";
import "./StudyHistoryCard.css"
const StudyHistoryCard = ({ history, formatDuration }) => {
  
  const [isFlipped, setIsFlipped] = useState(false)

  const toggleFlipped = () => {
    setIsFlipped((prev)=> !prev)
  }



  return (
    /* .wrapper에는 width/height 지정 X, daisyUI grid가 사이즈를 결정하도록 */
    <div className="wrapper" onClick={toggleFlipped}>
      {/* flip-card: daisyUI card 스타일과 병행해서 사용 가능 */}
      <div className={`flip-card card shadow-md p-4 bg-white text-center rounded-sm ${isFlipped ? "flipped" : ""}`}>
        {/* 앞면 */}
        <div className="front">
          <div className="card-body">
            <h3 className="card-title text-md font-medium mx-auto text-gray-800">
              스터디 ID: {history.group_conference_history_id}
            </h3>
            <hr className="font-extrabold"/>
            <p className="text-gray-600 text-sm">
              참여 시간:{" "}
              {history.duration ? formatDuration(history.duration) : "미기록"}
            </p>
            {/* ...etc... */}
          </div>
        </div>

        {/* 뒷면 */}
        <div className="back">
          <div className="card-body">
            <h3 className="text-md font-medium text-gray-800">스터디 메모</h3>
            <p className="text-gray-600 text-sm">메모가 표시될 공간입니다.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

StudyHistoryCard.propTypes = {
  history: PropTypes.shape({
    id: PropTypes.number.isRequired,
    group_conference_history_id: PropTypes.number.isRequired,
    joinTime: PropTypes.string,
    leaveTime: PropTypes.string,
    duration: PropTypes.number,
  }).isRequired,
  formatDuration:PropTypes.func,
};

export default StudyHistoryCard;
