import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { OpenVidu } from "openvidu-browser";
import { MdOutlineMic, MdOutlineMicOff, MdOutlineTvOff, MdOutlineTv } from "react-icons/md";

function SettingPage({ onSettingCheck }) {
  // 카메라·오디오 ON/OFF 기본값
  const [camera, setCamera] = useState(false);
  const [audio, setAudio] = useState(false);

  // OpenVidu 인스턴스 & Publisher
  const [OV, setOV] = useState(null);
  const [publisher, setPublisher] = useState(null);

  // video DOM 연결용 ref
  const videoRef = useRef(null);

  // 1) 컴포넌트 마운트 시 한 번만 publisher 초기화
  useEffect(() => {
    const openvidu = new OpenVidu();
    setOV(openvidu);

    // 최초 카메라·마이크 상태값 반영
    const newPublisher = openvidu.initPublisher(undefined, {
      audioSource: undefined, // 기본 마이크
      videoSource: undefined, // 기본 카메라
      publishAudio: audio,
      publishVideo: camera,
      resolution: "640x480",
      frameRate: 30,
      mirror: true,
    });

    // 로컬 미리보기 DOM 연결
    newPublisher.addVideoElement(videoRef.current);
    setPublisher(newPublisher);

    // 2) 언마운트 시점에만 dispose (세팅화면 종료 시)
    return () => {
      if (newPublisher && typeof newPublisher.dispose === "function") {
        newPublisher.dispose();
      }
    };
  }, []); // 빈 배열 => 마운트 시 한 번만

  // 카메라 토글
  const toggleCamera = () => {
    if (publisher) {
      // publishVideo(bool) => 실제 카메라 On/Off
      publisher.publishVideo(!camera);
    }
    setCamera(!camera);
  };

  // 마이크 토글
  const toggleAudio = () => {
    if (publisher) {
      // publishAudio(bool) => 실제 마이크 On/Off
      publisher.publishAudio(!audio);
    }
    setAudio(!audio);
  };

  // 3) 확인 (세팅 완료)
  const handleConfirm = () => {
    onSettingCheck?.();
  };

  return (
    <div className="p-4 max-w-sm mx-auto bg-base-100">
      <h2 className="text-lg font-bold mb-4">오디오·비디오 세팅 (Toggle 방식)</h2>

      <div className="mb-4 w-[320px] h-[240px] bg-black relative">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          autoPlay
          muted // 자기 영상은 보통 muted
        />
      </div>

      <div className="flex gap-4 mb-4">
        {/* 카메라 버튼 */}
        <button className="btn gap-2" onClick={toggleCamera}>
          {camera ? <MdOutlineTv size={24} /> : <MdOutlineTvOff size={24} />}
          {camera ? "카메라 ON" : "카메라 OFF"}
        </button>

        {/* 마이크 버튼 */}
        <button className="btn gap-2" onClick={toggleAudio}>
          {audio ? <MdOutlineMic size={24} /> : <MdOutlineMicOff size={24} />}
          {audio ? "마이크 ON" : "마이크 OFF"}
        </button>
      </div>

      <div className="flex justify-end">
        <button className="btn btn-accent" onClick={handleConfirm}>
          확인
        </button>
      </div>
    </div>
  );
}

SettingPage.propTypes = {
  onSettingCheck: PropTypes.func.isRequired,
};

export default SettingPage;
