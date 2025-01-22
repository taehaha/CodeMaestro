import { useNavigate } from "react-router-dom"
import { useState } from "react"
import { useSelector } from "react-redux"
import Swal from "sweetalert2"
import PropTypes from "prop-types";

const SettingPage = ({onSettingCheck, title})=>{
    const [audio, setaudio] = useState(false)
    const navigate = useNavigate()
    const user = useSelector((state) => state.user.myInfo); // state.user.myInfo로 접근


    // 세팅체크 확인버튼을 누르면 상위 컴포넌트에 전달
    const handleClick = () =>{
        Swal.fire({
            title:"설정 완료",
            text:"곧 회의실로 입장합니다.",
            icon:"success",
            confirmButtonText:"확인",
        }).then(()=>{onSettingCheck()})}
    
    const handleCancel = () => {
        Swal.fire({
            icon: 'info',
            title: '취소 시 메인 페이지로 이동합니다.',
            text: '메인 페이지로 이동하시겠습니까?',
            showCancelButton: true,
            confirmButtonText: '메인 페이지 이동', 
            cancelButtonText: '돌아가기',
            confirmButtonColor: '#429f50',
            cancelButtonColor: '#d33',
        }).then((res)=>{if (res.isConfirmed) {
            navigate("/")
        }})
    }
    return (<div className="modal-container">
        <p>세팅 페이지입니다. OPENVIDU 기본 세팅으로 할지 직접 구현할지는 아직 정하지 않았습니다.</p>
        <p>마이크 온 오프, 회의 참가 닉네임 등을 확인한 후 회의실 컴포넌트로 navigate 연결합니다.</p>
        <p>{title} 입장</p>
        <p>닉네임: {user.name}</p>
        <button
         className="dark-button"
         onClick={()=>{handleClick()}}>확인</button>
        <button
         className="dark-button"
         onClick={()=>{handleCancel()}}>취소</button>
    </div>)
}

SettingPage.propTypes = {
    title:PropTypes.string.isRequired,
    onSettingCheck: PropTypes.func.isRequired,
}

export default SettingPage