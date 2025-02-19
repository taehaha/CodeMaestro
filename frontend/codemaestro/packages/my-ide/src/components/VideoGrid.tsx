import React from "react";
import './VideoGrid.css'; 
import UserVideoComponent from "./UserVideoComponent";
import { Subscriber } from "openvidu-browser";

interface VideoGridProps {
  streamManagers: Subscriber[];
  isDarkMode: boolean;
}

const VideoGrid: React.FC<VideoGridProps> = ({ streamManagers, isDarkMode }) => {
  console.log("VideoGrid 렌더링 시작했다");
  
  return (
    <div className="video-grid">
      {streamManagers.map((sm, idx) => (
        <div
          key={idx}
          className="video-wrapper"
        >
          <UserVideoComponent streamManager={sm} isDarkMode={isDarkMode} key={sm.id}/>
        </div>
      ))}
    </div>
  );
};

export default VideoGrid;
