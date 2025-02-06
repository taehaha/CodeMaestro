import { useRef, useEffect } from "react";

const WebcamMockUp = () => {
  const videoRef = useRef(null);

  useEffect(() => {
    let localStream;

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        localStream = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch((err) => {
        console.log("카메라/마이크 접근 에러:", err);
      });

    // 정리(cleanup) 함수: 컴포넌트 언마운트 시 실행
    return () => {
      if (localStream) {
        // 모든 트랙(오디오, 비디오)을 중지
        localStream.getTracks().forEach((track) => {
          track.stop();
        });
      }
    };
  }, []); 
  // 빈 배열 의존성: 마운트 시에만 실행하고, 언마운트 시 cleanup

  return (
    <video
      ref={videoRef}
      autoPlay
      muted
      className="w-[417px] h-[250px] object-cover rounded-sm"
    />
  );
};

export default WebcamMockUp;
