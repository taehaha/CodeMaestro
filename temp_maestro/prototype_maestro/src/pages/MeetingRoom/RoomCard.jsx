/* eslint-disable react/prop-types */
import {FaLock} from "react-icons/fa"
import PropTypes from 'prop-types';
import Swal from "sweetalert2";
import {useNavigate } from "react-router-dom";


const RoomCard = ({name, isPassword, thumbnail, participants, languages, tag, roomId}) => {
    const navigate = useNavigate();
    const handlePopup = () => {

        if (!participants) {
            console.log("백엔드: 이 미팅은 리스트 호출 당시엔 진행중이지만, 지금은 회의가 종료되었습니다. 프론트: 넵")
            Swal.fire({
                title:"존재하지 않는 회의실",
                text:"미팅이 종료되어, 더이상 존재하지 않는 회의실입니다.",
                icon: "warning",
                confirmButtonText:"확인",
            })
        }

        else {
            if (isPassword) {
                Swal.fire({
                    title: "비밀번호 입력",
                    text: "비밀번호를 입력해야 입장할 수 있습니다.",
                    input: "password", // 비밀번호 입력 필드
                    inputPlaceholder: "비밀번호를 입력하세요",
                    showCancelButton: true,
                    confirmButtonText: "확인",
                    cancelButtonText: "취소",

                    preConfirm: (password) => {
                        // 비밀번호 유효성 검사 (옵션)
                        if (!password) {
                            Swal.showValidationMessage("비밀번호를 입력하세요.");
                        } else {
                            return password;
                        }
                    },
                }).then((password) => {
                    if (password.isConfirmed) {
                        console.log("프론트엔드: 비밀번호는 ", password.value,"니까 이걸 axios로 보내마"); // 비밀번호 처리 로직
                        console.log("백엔드: 맞으면 200 틀리면 401 비밀번호 없다면 404 일단 백엔드 연결 안되었으니 200 반환");
                        navigate(`/meeting/${roomId}`, { state: { response: 200 } });
                    }
                });

            } else {
                // redux에 저장해서 꺼내 쓸 예정
                Swal.fire({
                    title:"회의실 입장",
                    text:"회의실에 입장하는 기능이 추가될 예정입니다. 이 알림은 백엔드에서 200 받은거라 생각해 주세요",
                    icon: "success",
                    confirmButtonText:"확인",
                }).then(()=>{
                    navigate(`/meeting/${roomId}`, { state: { response:200 } })
                });

            }
        }
    }

    return (
        
<div onClick={() => handlePopup()} className="room-card">
      {/* 썸네일 영역 */}
      <div>
        {isPassword ? (
          <FaLock className="lock-icon" />
        ) : (
          <p>{thumbnail}</p>
        )}
      </div>
      {/* 방 이름 영역 */}
      <h3 className="room-name">{name}</h3>
      {/* 인원 수 */}
      {participants !== undefined && (
        <p className="participant-count">{participants}명</p>
      )}
      {/* 언어 정보 */}
      {languages && (
        <p className="info-text">
          언어: {languages.join(", ")}
        </p>
      )}
      {/* 태그 정보 */}
      {tag && (
        <p className="info-text">
          태그: {tag.join(", ")}
        </p>
      )}
    </div>
    );
}

RoomCard.propTypes = {
    name: PropTypes.string.isRequired,
    isPassword: PropTypes.bool.isRequired,
    participants: PropTypes.number,
    languages: PropTypes.arrayOf(PropTypes.string),
    tags: PropTypes.arrayOf(PropTypes.string),
  };

export default RoomCard