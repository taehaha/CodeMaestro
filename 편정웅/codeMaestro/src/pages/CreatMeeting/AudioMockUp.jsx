import { useState, useRef, useEffect } from "react";

const AudioMockUp = () => {

    const [isRecording, setIsRecording] = useState(false);
    const [audioLevel, setAudioLevel] = useState(0);
    const audioContextRef = useRef(null);
    const analyserRef = useRef(null);
    const microphoneRef = useRef(null);
    const animationFrameId = useRef(null);

    const onRecord = async () => {
        try {
            setIsRecording(true);
            // 1. 마이크 사용 권한 요청 및 스트림 생성 : 스트림 변수 안에 마이크 데이터가 들어있음
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            // 2. AudioContext 생성 : 오디오컨텍스트는 오디오 신호를 생성하고 처리하는 플랫폼 역할 
            audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
            // 3. analyser 생성 : analyser는 오디오 신호를 분석하는 역할 (주파수)
            analyserRef.current = audioContextRef.current.createAnalyser();
            // 4. 마이크로부터 받은 오디오 데이터가 stream 안에 들어있는데, 그걸 2에서 만든 오디오컨텍스트에 등록
            microphoneRef.current = audioContextRef.current.createMediaStreamSource(stream);
            // 5. 3에서 만든 분석기에 4에서 등록한 데이터를 연결
            microphoneRef.current.connect(analyserRef.current);
            // 6. 분석기에 연결된 데이터를 Uint8Array로 변환 unit8array란? 8비트 부호없는 정수 배열, 주파수 데이터를 담을 배열
            const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
            // 7. 실시간으로 배열에 담긴 데이터들의 평균값을 구해서 audioLevel로 설정
            const checkAudioLevel = () => {
                // 데이터 배열을 가져와서 dataArray에 넣어줌
                analyserRef.current.getByteFrequencyData(dataArray);
                // 볼륨 추정 방식 : 데이터 배열의 평균값을 audioLevel로 설정
                const average = dataArray.reduce((acc, cur) => acc + cur, 0) / dataArray.length;
                setAudioLevel(average);
                // 지속적으로 오디오 레벨을 지우고, 다시 그리는 역할 (애니메이션처럼 보이게)
                animationFrameId.current = requestAnimationFrame(checkAudioLevel);
            }

            // 8. 7에서 만든 함수 실행
            checkAudioLevel();


        } catch (error) {
            console.log(error);
        }
        
    };

    const onStop = () => {
        // 오디오 컨텍스트 닫기
        if (audioContextRef.current && audioContextRef.current.state !== "closed") {
            audioContextRef.current.close();
        }
        // 이미지 프레임 생성 중지
        if (animationFrameId.current) {
            cancelAnimationFrame(animationFrameId.current);
        }

        // 기타 변수 초기화
        setIsRecording(false);
        setAudioLevel(0);
    };

    // 컴포넌트가 다시 마운트 되었을 때, 언마운트 될 때 녹음 중지
    useEffect(() => {
        return () => {
            // 열어둔 오디오 컨텍스트를 닫아줌
            if (audioContextRef.current && audioContextRef.current.state !== "closed") {
                audioContextRef.current.close();
            }
            // 이미지 프레임 생성 중지
            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
            }
        }
    }, []) // 빈 배열 붙이는 이유? 컴포넌트가 마운트 되었을 때 한 번만 실행되도록 하기 위함


    return (
    <div className="bg-primaryBoxcolor dark:bg-darkBoxColor p-4 flex flex-col items-center rounded-sm">
      {isRecording ? (
          <button className="btn btn-error rounded-sm" onClick={()=>{onStop()}}>재생 중지</button>          
      ) : (
          <button className="btn btn-warning rounded-sm" onClick={()=>{onRecord()}}>재생 시작</button>
      )}
      {isRecording && 
      <div>
        {/* Audio Level: {audioLevel} */}
        <span>음량</span>
        <div
        className="h-2 bg-green-500 transition-all duration-75 my-4 items-start" // 0.5초마다 음량 변화를 보여주기 위한 transition
        style={{ width: `${audioLevel}px` }} // 동적 길이 할당은 tailwindcss가 지원하지 않기 때문에 style로 직접 지정 
        />
        </div>}
    </div>
  );
}

export default AudioMockUp;