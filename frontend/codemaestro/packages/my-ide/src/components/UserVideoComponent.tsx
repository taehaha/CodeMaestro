// ScreenShareComponent.tsx
import { StreamManager } from 'openvidu-browser';
import React, { useEffect, useRef, useState } from 'react';
import { ConnectionData } from '../OpenviduClient';

interface UserVideoComponentProps {
  streamManager: StreamManager; // 화면 공유 스트림 매니저 (Publisher 또는 Subscriber)
  isDarkMode: boolean;
}

const UserVideoComponent: React.FC<UserVideoComponentProps> = ({ streamManager, isDarkMode }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const userInfoRef = useRef<HTMLDivElement>(null);
  const [connectionData, setConnectionData] = useState<ConnectionData | null>(null);

  useEffect(() => {
    const jsonData = streamManager.stream.connection.data;
    if (jsonData) {
      setConnectionData(JSON.parse(jsonData));
    } else {
      setConnectionData(null);
    }
  }, [streamManager]);

  useEffect(() => {
    if (streamManager && videoRef.current) {
      // 화면 공유 스트림이 video element에 추가되도록 처리
      streamManager.addVideoElement(videoRef.current);
    }
  }, [streamManager]);

  return (
    <div className="w-full h-full relative">
      <video ref={videoRef} autoPlay className="w-full h-full rounded" />
      <div
        ref={userInfoRef}
        className={`absolute top-2 left-2 z-10 px-2 py-1 rounded ${
          isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'
        }`}
      >
        {connectionData ? connectionData.nickname : '이름 불러오기 실패'}
      </div>
    </div>
  );
};

export default UserVideoComponent;
