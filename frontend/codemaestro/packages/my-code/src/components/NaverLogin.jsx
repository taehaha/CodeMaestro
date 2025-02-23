import { baseURL } from "../api/userAxios"

const NaverLoginButton = () => {

    const URL_NAVER = `${baseURL}/oauth2/authorization/naver`
    
    const handleNaverLogin = () => {
        window.location.href= URL_NAVER
    }

    return(
        <button
        onClick={handleNaverLogin}>
            <img src={'/naver.png'}></img>
        </button>

    )
}

export default NaverLoginButton;