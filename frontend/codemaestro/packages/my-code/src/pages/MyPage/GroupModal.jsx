import React, { useState } from "react";
import "./GroupModal.css";

const GroupModal = ({ onClose, onCreate }) => {
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");

  const handleCreate = () => {
    if (groupName.trim() === "" || groupDescription.trim() === "") {
      alert("그룹명과 설명을 입력해주세요.");
      return;
    }
    onCreate({ name: groupName, description: groupDescription });
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        {/* <button className="close-btn" onClick={onClose}>
          &times;
        </button> */}
        <h2>그룹 생성하기</h2>

        <label>그룹명 (최대 10자)</label>
        <input 
          type="text" 
          placeholder="그룹명을 입력하세요" 
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          maxLength={10}
        />
        
        <label>그룹 설명 (최대 100자)</label>
        <textarea 
          placeholder="그룹 설명을 입력하세요" 
          value={groupDescription}
          onChange={(e) => setGroupDescription(e.target.value)}
          maxLength={100}
        />
        <div className="char-count">
          {groupDescription.length} / 100
        </div>

        <div className="modal-buttons">
          <button className="confirm-btn" onClick={handleCreate}>완료</button>
          <button className="group-cancel-btn" onClick={onClose}>취소</button>
        </div>
      </div>
    </div>
  );
};

export default GroupModal;
