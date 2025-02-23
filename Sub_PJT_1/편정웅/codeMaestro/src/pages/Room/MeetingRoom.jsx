import { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import PasswordCheck from './PasswordCheck';
import SettingPage from './SettingPage';
const MeetingRoom = () => {
    
  // 1) 비밀번호 검증 여부
  const [isPasswordVerified, setIsPasswordVerified] = useState(false);
  // 2) 사전 오디오/비디오 셋팅 완료 여부
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  // 방 id
  const { id } = useParams();


    // 비밀방 인증 여부를 임시로 구분하기 위한 상태들.
    const location = useLocation();
    const [isPassword] = useState(location.state?.isPassword);
    const isPrivateRoom = isPassword;
    // 반응 200, 401, 403 구분용 임시 변수를 받는 로케이션. 실제로는 axios 요청 응답으로 구분할 것임.




    useEffect( ()=>{
        if (isPasswordVerified && isSetupComplete) {
            console.log('여기에 소켓을 보내고, 방 참여를 백엔드에 전달하는 로직이 들어갈 거에요');   
        }
    },[isPasswordVerified, isSetupComplete])

    //비밀방 인증 성공, 세팅 완료시 각각 시행될 함수들
    const onPasswordCheck = () => {
        setIsPasswordVerified(true);
      };
      const onSettingCheck = () => {
        setIsSetupComplete(true);
      };


      return (
        <div className="dark:text-darkText">
          {/* PasswordCheck 모달 */}
          {isPrivateRoom && !isPasswordVerified && (
            <div className='flex justify-center p-4'>
            <PasswordCheck
              roomId={id}
              title={`${id}번 회의실`} // 실제론 가져온 정보 기반 room.id , room.title
              onPasswordCheck={onPasswordCheck}
            />
            </div>
          )}
    
          {/* SettingPage 모달 */}
          {(isPasswordVerified || !isPassword) && !isSetupComplete && (
            <div className='w-1/5'>
            <SettingPage
            title={`${id}번 회의실`} 
            onSettingCheck={onSettingCheck} />
            </div>
          )}
    
          {/* 룸 화면 */}
          {(isPasswordVerified || !isPassword) && isSetupComplete && (
            <div className="room">
              <h2>{id}번 회의실 컴포넌트</h2>
              {/* Room 컴포넌트 */}
              <p>회의가 시작되었습니다.</p>
            </div>
          )}
        </div>
      );
    };

export default MeetingRoom;