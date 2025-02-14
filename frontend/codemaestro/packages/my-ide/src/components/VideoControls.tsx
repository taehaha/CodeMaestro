import React, { useMemo, useState } from "react";
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  PhoneOff, 
  Monitor, 
  ChevronUp, 
  ChevronDown 
} from "lucide-react";
import { Publisher, StreamManager } from "openvidu-browser";
import { OpenviduClient } from "../OpenviduClient";

interface VideoControlsProps {
  ovClient: OpenviduClient;
  ovPublisher: Publisher;
  ovScreenStreamManager: StreamManager | null
  onLeave?: () => void;
}

const VideoControls: React.FC<VideoControlsProps> = ({
  ovClient,
  ovPublisher,
  ovScreenStreamManager,
  onLeave,
}) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isAudioActive, setIsAudioActive] = useState(ovPublisher.stream.audioActive);
  const [isVideoActive, setIsVideoActive] = useState(ovPublisher.stream.videoActive);

  // const isAudioActive: boolean = useMemo(() => {
  //   return ovPublisher ? ovPublisher.stream.hasAudio : false;
  // }, [ovPublisher]);

  // const isVideoActive: boolean = useMemo(() => {
  //   return ovPublisher ? ovPublisher.stream.hasVideo : false;
  // }, [ovPublisher]);

  const isScreenActive: boolean = useMemo(() => {
    return ovScreenStreamManager instanceof StreamManager;
  }, [ovScreenStreamManager]);

  const isMyScreen: boolean = useMemo(() => {
    return ovScreenStreamManager instanceof Publisher;
  }, [ovScreenStreamManager]);

  // 마이크 토글
  const handleToggleAudio = () => {
    console.log("마이크 토글");
    setIsAudioActive(!ovPublisher.stream.audioActive);
    ovPublisher.publishAudio(!ovPublisher.stream.audioActive);
  };

  // 카메라 토글
  const handleToggleVideo = () => {
    console.log("카메라 토글");
    setIsVideoActive(!ovPublisher.stream.videoActive);
    ovPublisher.publishVideo(!ovPublisher.stream.videoActive);
  };

  // 화면공유 시작
  const StartScreenShare = () => {
    if (isScreenActive) return;

    ovClient.publishMyScreen();
  }

  // 화면공유 종료
  const EndScreenShare = () => {
    if (isMyScreen) {
      ovClient.unpublishMyScreen();
    }
  }

  // 세션 나가기
  const handleLeaveSession = () => {
    if (ovClient) {
      ovClient.disconnect();
    }
    if (onLeave) {
      onLeave();
    }
    // /meeting 경로로 이동
    window.location.href = "/meeting";
  };

  // 최소화/확대 
  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  return (
    <div
      className={`
        fixed bottom-0 left-1/2 transform -translate-x-1/2
        bg-gray-900 text-white rounded-t-lg shadow-lg
        transition-all duration-300 overflow-hidden
        ${isMinimized ? "h-12" : "h-16"} px-4
      `}
    >
      <div className="flex items-center justify-center h-full space-x-4">
        {!isMinimized && (
          <>
            <button
              onClick={handleToggleAudio}
              className="flex flex-col items-center justify-center p-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors duration-200"
            >
              {isAudioActive ? (
                <Mic className="w-6 h-6" />
              ) : (
                <MicOff className="w-6 h-6 text-red-400" />
              )}
              <span className="text-xs mt-1">
                {isAudioActive ? "음소거" : "마이크 켜기"}
              </span>
            </button>

            <button
              onClick={handleToggleVideo}
              className="flex flex-col items-center justify-center p-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors duration-200"
            >
              {isVideoActive ? (
                <Video className="w-6 h-6" />
              ) : (
                <VideoOff className="w-6 h-6 text-red-400" />
              )}
              <span className="text-xs mt-1">
                {isVideoActive ? "카메라 끄기" : "카메라 켜기"}
              </span>
            </button>

            <button
              onClick={isMyScreen ? EndScreenShare : StartScreenShare}
              disabled={isScreenActive && !isMyScreen}
              className="flex flex-col items-center justify-center p-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors duration-200"
              
            >
              <Monitor className={`w-6 h-6 ${isMyScreen ? "text-green-400" : ""}`} />
              <span className="text-xs mt-1">
                {isMyScreen ? "공유 중지" : "화면 공유"}
              </span>
            </button>

            <button
              onClick={handleLeaveSession}
              className="flex flex-col items-center justify-center p-2 bg-red-600 hover:bg-red-500 rounded transition-colors duration-200"
            >
              <PhoneOff className="w-6 h-6" />
              <span className="text-xs mt-1">나가기</span>
            </button>
          </>
        )}

        <button
          onClick={toggleMinimize}
          className={`flex flex-col items-center justify-center ${isMinimized ? "p-2" : "py-4 px-2"} bg-gray-800 hover:bg-gray-700 rounded transition-transform duration-300`}
          title={isMinimized ? "확대" : "최소화"}
        >
          {isMinimized ? (
            <ChevronUp className="w-5 h-5" />
          ) : (
            <ChevronDown className="w-5 h-5" />
          )}
          {!isMinimized && <span className="text-xs mt-1">최소화</span>}
        </button>
      </div>
    </div>
  );
};

export default VideoControls;
