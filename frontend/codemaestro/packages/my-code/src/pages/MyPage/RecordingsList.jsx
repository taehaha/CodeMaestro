import React, { useState } from "react";
import "./RecordingsList.css";

const RecordingsList = () => {
  const [recordings, setRecordings] = useState([
    { id: 1, title: "1월 회의", date: "2024-01-10" },
    { id: 2, title: "2월 회의", date: "2024-02-15" },
  ]);

  return (
    <div className="recordings-list">
      <h2>스터디디 녹화 목록</h2>
      <ul>
        {recordings.length > 0 ? (
          recordings.map((rec) => (
            <li key={rec.id} className="recording-item">
              <span>{rec.title} - {rec.date}</span>
              <button className="play-btn">재생</button>
            </li>
          ))
        ) : (
          <p className="no-recordings">녹화된 회의가 없습니다.</p>
        )}
      </ul>
    </div>
  );
};

export default RecordingsList;
