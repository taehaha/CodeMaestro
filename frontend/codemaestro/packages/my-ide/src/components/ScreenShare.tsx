// src/components/ScreenShare.tsx
import React from "react";
import OpenBidooComponent from "./OpenBidooComponent";

interface ScreenShareProps {
  streamManager: any; 
}

const ScreenShare: React.FC<ScreenShareProps> = ({ streamManager }) => {
  return (
    <div className="h-full flex flex-col">
      <h3 className="text-lg font-bold mb-2">화면 공유 중</h3>
      <OpenBidooComponent streamManager={streamManager} />
    </div>
  );
};

export default ScreenShare;
