import { baseURL } from "../api/userAxios"

const KaKaoLoginButton = () => {

    const URL_KAKAO = `${baseURL}/oauth2/authorization/kakao`
    
    const handleKakaoLogin = () => {
        window.location.href= URL_KAKAO
    }

    return(
        <button
        onClick={handleKakaoLogin}>
            <img src={'/kakao.png'}></img>
        </button>

    )
}

export default KaKaoLoginButton;