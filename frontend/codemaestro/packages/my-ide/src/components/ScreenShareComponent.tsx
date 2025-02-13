// ScreenShareComponent.tsx
import React, { useEffect, useRef } from 'react';

interface ScreenShareComponentProps {
  streamManager: any; // 화면 공유 스트림 매니저 (Publisher 또는 Subscriber)
}

const ScreenShareComponent: React.FC<ScreenShareComponentProps> = ({ streamManager }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (streamManager && videoRef.current) {
      // 화면 공유 스트림이 video element에 추가되도록 처리
      streamManager.addVideoElement(videoRef.current);
    }
  }, [streamManager]);

  return (
    <div className="w-full h-full">
      <video ref={videoRef} autoPlay className="w-full h-full rounded" />
    </div>
  );
};

export default ScreenShareComponent;
