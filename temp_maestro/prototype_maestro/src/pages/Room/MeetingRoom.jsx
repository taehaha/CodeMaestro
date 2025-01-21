import { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';

const MeetingRoom = () => {
    // 인증 여부를 임시로 구분하기 위한 상태
    const [isVerified, setIsVerified] = useState(false);
    // 방 id
    const { id } = useParams();
    
    // 반응 200, 401, 403 구분용 임시 변수를 받는 로케이션
    const location = useLocation();
    const [response] = useState(location.state?.response || 401);

    // 원래는 useEffect를 사용해서 로그인 여부를 확인하고, 로그인이 되어있지 않다면 로그인 페이지로 이동하도록 해야함
    useEffect(()=>{
        if(response === 200){
            setIsVerified(true);
        }

        else {
            Swal.fire({
                title:"회의실 직링크 입장 테스트",
                text:"",
                html: `
                <p style="margin: 10px 0;">이 회의실에 입장하기 위해선 비밀번호 입력이 필요합니다.</p>
                <div style="display: flex; align-items: center; gap: 10px; justify-content: center;">
                    <input s
                        type="password" 
                        value=""  
                        style="width: 250px; padding: 5px; border-radius: 5px; border: 1px solid #ddd; text-align: center; font-size: 14px;" 
                        id="passwordInput"
                    />
                </div>
            `,
                preConfirm: () => {
                    const password = document.getElementById("passwordInput").value; // input 값 가져오기
                    if (!password) {
                        Swal.showValidationMessage("비밀번호를 입력하세요."); // 비밀번호 미입력 시 경고 메시지
                    }
                    return password; // 입력값 반환
                },
                confirmButtonText:"확인",}).then((result) => {
                    if (result.isConfirmed) {
                        console.log("입력된 비밀번호:", result.value); // 입력된 비밀번호 확인
                    }})       
        }
    }, [response]);

    return (
        <div className='text-darkText'>
      {!isVerified && (<div className="room">
        <h2>회의실 입장을 위해 로그인이 필요합니다.</h2>
        <button onClick={() => setIsVerified(true)}>로그인</button>
      </div>)}
      {/* 룸 화면 */}
      {isVerified && (
        <div className="room">
          <h2>{id}번 회의실 컴포넌트</h2>
          {/* Room 컴포넌트 */}
        </div>
      )}
        </div>

    );
};

export default MeetingRoom;