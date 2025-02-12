import React from "react";
import OpenBidooComponent from "./OpenBidooComponent";
import './VideoGrid.css'; 

interface VideoGridProps {
  streamManagers: any[];
  currentUser: any; // 현재 사용자
  onSelectUser: (streamManager: any) => void; 
}

const VideoGrid: React.FC<VideoGridProps> = ({ streamManagers, currentUser, onSelectUser }) => {
  return (
    <div className="video-grid">
      {streamManagers.map((sm, idx) => (
        <div
          key={idx}
          className="video-wrapper"
          onClick={() => onSelectUser(sm)} // 비디오 클릭 시 해당 상대 비디오 확대
        >
          <OpenBidooComponent streamManager={sm} />
        </div>
      ))}
    </div>
  );
};

export default VideoGrid;
