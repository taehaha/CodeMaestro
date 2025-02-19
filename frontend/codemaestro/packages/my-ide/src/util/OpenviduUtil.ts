async function checkCamAndMic() {
    try {
        const mediaStream: MediaStream  = await navigator.mediaDevices.getUserMedia({video: true, audio: true});
    } catch (err) {
        console.log("미디어(캠, 마이크) 권한 없음 오류");
        alert("카메라, 마이크를 허용해주세요.");
        if (process.env.REACT_APP_FRONTEND_URL) {
            window.location.href=`${process.env.REACT_APP_FRONTEND_URL}/meeting`;
        }
    }
}

export { checkCamAndMic };