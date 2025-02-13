import React, { useEffect, useMemo, useRef } from "react";

interface OpenBidooComponentProps {
  streamManager: any; // 실제 타입에 맞게 수정하세요.
}

const OpenBidooComponent: React.FC<OpenBidooComponentProps> = ({ streamManager }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (streamManager && videoRef.current) {
      console.log("스트림 관리자 추가됨:", streamManager);
      streamManager.addVideoElement(videoRef.current);
    } else {
      console.error("스트림 관리자가 없습니다.");
    }
  }, [streamManager]);

  const clientData = useMemo(() => {
    if (!streamManager?.stream?.connection) return null;
    try {
      const data = JSON.parse(streamManager.stream.connection.data);
      return data.clientData;
    } catch (error) {
      console.error("Connection data 파싱 오류:", error);
      return null;
    }
  }, [streamManager]);

  if (!streamManager) {
    console.error("스트림 관리자가 없습니다.");
    return <div>No stream manager available</div>;
  }

  return (
    <div>
      <video ref={videoRef} autoPlay className="w-full rounded" />
    </div>
  );
};

export default OpenBidooComponent;
