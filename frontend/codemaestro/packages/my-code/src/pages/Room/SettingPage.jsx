import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { OpenVidu } from "openvidu-browser";
import { MdOutlineMic, MdOutlineMicOff, MdOutlineTvOff, MdOutlineTv } from "react-icons/md";
import localStorage from "redux-persist/es/storage";
function SettingPage({ onSettingCheck }) {
  // 카메라·오디오 ON/OFF 기본값
  const [camera, setCamera] = useState(false);
  const [audio, setAudio] = useState(false);

  // OpenVidu 인스턴스 & Publisher
  const [OV, setOV] = useState(null);
  const [publisher, setPublisher] = useState(null);
  const [isCameraAvailable, setIsCameraAvailable] = useState(true); // 카메라 사용 가능 여부
  const [isAudioAvailable, setIsAudioAvailable] = useState(true); // 마이크 사용 가능 여부
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

    // 미디어 사용 가능 여부 확인
    checkMediaAvailability();

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

  const checkMediaAvailability = () => {
    navigator.mediaDevices.enumerateDevices().then((devices) => {
      const cameraDevices = devices.filter(device => device.kind === 'videoinput');
      const audioDevices = devices.filter(device => device.kind === 'audioinput');

      setIsCameraAvailable(cameraDevices.length > 0);
      setIsAudioAvailable(audioDevices.length > 0);
    });
  };


  // 3) 확인 (세팅 완료)
  const handleConfirm = async () => {
    await localStorage.setItem("camera",camera)
    await localStorage.setItem("audio",audio)
    onSettingCheck?.();
  };

  return (
    <div className="p-4 max-w-sm mx-auto bg-base-100 flex flex-col h-[420px]">
  <h2 className="text-lg mb-4 ml-5">오디오·비디오 세팅 (Toggle 방식)</h2>

  {!isCameraAvailable && ( // 카메라 사용 불가 시 안내 문구
    <p className="text-red-500 text-sm mb-2 ml-5">📷 카메라를 찾을 수 없습니다.</p>
  )}
  {!isAudioAvailable && ( // 마이크 사용 불가 시 안내 문구
    <p className="text-red-500 text-sm mb-2 ml-5">🎤 마이크를 찾을 수 없습니다.</p> 
  )}

  <div className="mb-4 w-[320px] h-[240px] bg-black mx-auto relative">
    <video
      ref={videoRef}
      className="w-full h-full object-cover"
      autoPlay
      muted
    />
  </div>
  <div className="flex gap-4 mb-4">
    <button className="btn gap-2 ml-9" onClick={toggleCamera}>
      {camera ? <MdOutlineTv size={24} /> : <MdOutlineTvOff size={24} />}
      {camera ? "카메라 ON" : "카메라 OFF"}
    </button>

    <button className="btn gap-2" onClick={toggleAudio}>
      {audio ? <MdOutlineMic size={24} /> : <MdOutlineMicOff size={24} />}
      {audio ? "마이크 ON" : "마이크 OFF"}
    </button>
  </div>

  {/* 🔥 "확인" 버튼을 컨테이너 하단에 배치 */}
  <div className="flex justify-end pl-3 mt-auto">
    <button className="btn px-4 text-white bg-[#FFCC00] hover:bg-[#f0c000]" onClick={handleConfirm}>
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
