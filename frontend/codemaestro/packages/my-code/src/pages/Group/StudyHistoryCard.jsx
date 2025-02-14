import PropTypes from "prop-types";
import { useState, useEffect } from "react";
import { GetMemo, DeleteMemo, PutMemo } from "../../api/HistoyApi";
import { AiOutlineInfoCircle, AiFillEdit, AiOutlineDelete } from "react-icons/ai";
import "./StudyHistoryCard.css"; // flip-card 관련 css

const StudyHistoryCard = ({ history, formatDuration, toggleModal }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [memo, setMemo] = useState(null);

  // 메모 수정 상태
  const [isEdit, setIsEdit] = useState(false);
  // 메모 수정 시 임시로 입력할 컨텐츠
  const [editContent, setEditContent] = useState("");

  const toggleFlipped = () => {
    // 편집 중인 경우 카드를 뒤집지 않도록 예시 (편집 중엔 고정)
    if (!isEdit) {
      setIsFlipped((prev) => !prev);
    }
  };

  useEffect(() => {
    const fetchMemo = async () => {
      try {
        const res = await GetMemo(history.id);
        if (res) {
          setMemo(res);
        } else {
          setMemo(null);
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchMemo();
  }, [history.id]);

  // 메모 수정 아이콘 클릭시
  const handleEditClick = (e) => {
    e.stopPropagation(); // 카드 뒤집힘 방지
    if (!memo) return;   // 메모가 없는 경우는 새로 작성하도록
    setIsEdit(true);
    setEditContent(memo?.studyContent || "");
  };

  // 메모 수정 저장
  const handleSaveEdit = async (e) => {
    e.stopPropagation();
    try {
      // PUT 메모 API 호출
      await PutMemo(history.id, { studyContent: editContent });
      // state 갱신
      setMemo({ studyContent: editContent });
      setIsEdit(false);
    } catch (error) {
      console.error(error);
    }
  };

  // 메모 삭제
  const handleDeleteMemo = async (e) => {
    e.stopPropagation();
    try {
      await DeleteMemo(history.id);
      setMemo(null);
      setIsEdit(false);
    } catch (error) {
      console.error(error);
    }
  };

  // 메모 작성 모달을 호출할 때
  const handleAddMemo = (e) => {
    e.stopPropagation(); 
    toggleModal(history.id);
  };

  // 편집 취소
  const handleCancelEdit = (e) => {
    e.stopPropagation();
    setIsEdit(false);
    setEditContent(memo?.studyContent || "");
  };

  return (
    <div className="wrapper" onClick={toggleFlipped}>
      <div
        className={`flip-card card shadow-md p-4 bg-white text-center rounded-sm transition-transform duration-300 ${
          isFlipped ? "flipped" : ""
        }`}
      >
        {/* 앞면 */}
        <div className="front">
          <div className="card-body">
            <h3 className="card-title text-md font-medium mx-auto text-gray-800">
              스터디 ID: {history.groupConferenceHistoryId}
            </h3>
            <hr className="font-extrabold my-2" />
            <p className="text-gray-600 text-sm">
              참여 시간:{" "}
              {history.duration ? formatDuration(history.duration) : "미기록"}
            </p>
          </div>
        </div>

        {/* 뒷면 */}
        <div className="back">
          {/* 메모가 없는 상태 */}
          {!memo && !isEdit && (
            <div className="card-body flex flex-col items-center justify-center gap-2 text-gray-600">
              <AiOutlineInfoCircle className="w-8 h-8 mb-1 text-gray-400" />
              <p className="text-sm">아직 메모가 작성되지 않았습니다.</p>
              <button 
                className="btn btn-primary rounded-sm"
                onClick={handleAddMemo}
              >
                메모 작성하기
              </button>
            </div>
          )}

          {/* 메모가 있는 상태 + 수정중이 아닐 때 */}
          {memo && !isEdit && (
            <div className="card-body flex flex-col items-center justify-center gap-4 text-gray-600">
              <p className="text-gray-600 text-sm whitespace-pre-wrap">
                {memo.studyContent}
              </p>
              <div className="flex items-center gap-3">
                {/* 수정 아이콘 */}
                <AiFillEdit
                  className="cursor-pointer text-blue-500 text-xl hover:text-blue-700"
                  onClick={handleEditClick}
                  title="메모 수정"
                />
                {/* 삭제 아이콘 */}
                <AiOutlineDelete
                  className="cursor-pointer text-red-500 text-xl hover:text-red-700"
                  onClick={handleDeleteMemo}
                  title="메모 삭제"
                />
              </div>
            </div>
          )}

          {/* 수정 중인 상태 */}
          {isEdit && (
            <div className="card-body flex flex-col items-center gap-3">
              <textarea
                className="textarea textarea-bordered w-full h-1/3"
                rows={4}
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
              />
              <div className="flex gap-2">
                <button
                  className="btn btn-primary btn-sm"
                  onClick={handleSaveEdit}
                >
                  저장
                </button>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={handleCancelEdit}
                >
                  취소
                </button>
              </div>
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
  formatDuration: PropTypes.func,
  toggleModal: PropTypes.func,
};

export default StudyHistoryCard;
