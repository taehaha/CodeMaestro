import { useState } from "react";
import "../MyPage/GroupModal";

// eslint-disable-next-line react/prop-types
const MemoModal = ({ onClose, onCreate, historyId }) => {
  const [description, setDescription] = useState("");

  const handleCreate = () => {
    if (description.trim() === "") {
      alert("입력해주세요.");
      return;
    }
    onCreate({ historyId:historyId, studyContent:description });
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <button className="close-btn" onClick={onClose}>
          &times;
        </button>
        <h2>스터디 메모 기록</h2>
        <label> 설명 (최대 255자)</label>
        <textarea  
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={255}
        />
        <div className="char-count">
          {description.length} / 255
        </div>

        <div className="modal-buttons">
          <button className="group-cancel-btn" onClick={onClose}>취소</button>
          <button className="confirm-btn" onClick={handleCreate}>완료</button>
        </div>
      </div>
    </div>
  );
};

export default MemoModal;
