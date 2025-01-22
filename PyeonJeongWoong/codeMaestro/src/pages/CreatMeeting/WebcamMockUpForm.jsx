// 아직 openvidu, 백엔드 연동 하나도 모르는 상태... 
// 그냥 목업 그럴싸하게 만들어주는 사이버 거울 띄운다는 감각으로 접근...

import { useRef, useEffect } from "react";
// video DOM에 직접 접근해야 하기 때문에 useref 사용

const WebcamMockUp = () => {

    const videoRef = useRef(null)


// useeffect >> vue유법 : onMounted()
    useEffect(()=>{
        navigator.mediaDevices
        .getUserMedia({video:true, audio:true})
        .then((stream) =>{
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
              }
        })
        .catch((err) => {
            console.log(err);
        })
    })

    return(
        <video
        ref={videoRef}
        autoPlay
        muted
        className="w-[417px] h-[250px] object-cover rounded-sm">
        </video>
    );
};

export default WebcamMockUp