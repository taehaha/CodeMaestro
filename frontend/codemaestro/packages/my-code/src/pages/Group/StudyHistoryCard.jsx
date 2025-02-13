import PropTypes from "prop-types";
import { useState } from "react";
import "./StudyHistoryCard.css"
import { useEffect } from "react";
import { GetMemo, DeleteMemo } from "../../api/HistoyApi";
import { AiOutlineInfoCircle } from "react-icons/ai";

const StudyHistoryCard = ({ history, formatDuration, toggleModal }) => {
  
  const [isFlipped, setIsFlipped] = useState(false)
  const [memo, setMemo] = useState(null)

  const toggleFlipped = () => {
    setIsFlipped((prev)=> !prev)
  }

  useEffect(()=>{
    const fetchMemo = async () => {
        const res = await GetMemo(history.id)
        setMemo(res || "")
    }

    fetchMemo()
  },[history.id])


  return (
    /* .wrapper에는 width/height 지정 X, daisyUI grid가 사이즈를 결정하도록 */
    <div className="wrapper" onClick={toggleFlipped}>
      {/* flip-card: daisyUI card 스타일과 병행해서 사용 가능 */}
      <div className={`flip-card card shadow-md p-4 bg-white text-center rounded-sm ${isFlipped ? "flipped" : ""}`}>
        {/* 앞면 */}
        <div className="front">
          <div className="card-body">
            <h3 className="card-title text-md font-medium mx-auto text-gray-800">
              스터디 ID: {history.groupConferenceHistoryId}
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
        {!memo && (
            <div className="card-body flex flex-col items-center justify-center gap-2 text-gray-600">
                {/* 안내 아이콘 */}
                <AiOutlineInfoCircle className="w-8 h-8 mb-1 text-gray-400" />
                {/* 안내 문구 */}
                <p className="text-sm">아직 메모가 작성되지 않았습니다.</p>
                {/* 메모 작성 버튼 */}
                <button
                className="btn btn-primary rounded-sm"
                onClick={(e) => {
                    e.stopPropagation(); // 카드 뒤집기 방지용 (필요 시)
                    toggleModal(history.id);
                }}
                >
                메모 작성하기
                </button>
            </div>
            )}

        {memo && (
            <div className="card-body flex flex-col items-center justify-center gap-2 text-gray-600">
                {/* 메모 작성 버튼 */}
                <p className="text-gray-600 text-sm">{memo.studyContent}</p>
            </div>
            )}
        </div>
      </div>
      


    </div>
  );
};

StudyHistoryCard.propTypes = {
  history: PropTypes.shape({
    id: PropTypes.number.isRequired,
    groupConferenceHistoryId: PropTypes.number.isRequired,
    joinTime: PropTypes.string,
    leaveTime: PropTypes.string,
    duration: PropTypes.number,
  }).isRequired,
  formatDuration:PropTypes.func,
  toggleModal:PropTypes.func,
};

export default StudyHistoryCard;
