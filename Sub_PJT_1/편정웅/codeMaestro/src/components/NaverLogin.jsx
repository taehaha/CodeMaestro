const NaverLoginButton = () => {

    const NAVER_API = import.meta.env.NAVER_API_KEY
    const NAVER_REDIRECT = import.meta.env.NAVER_REDIRECT_URL
    const NAVER_STATE = import.meta.env.NAVER_STATE
    const URL_NAVER = `https://nid.naver.com/oauth2.0/authorize?client_id=${NAVER_API}&response_type=code&redirect_uri=${NAVER_REDIRECT}&state=${NAVER_STATE}`
    
    const handleNaverLogin = () => {
        window.location.href= URL_NAVER
    }

    return(
        <button
        onClick={handleNaverLogin}>
            테스트용 로그인버튼
        </button>

    )
}

export default NaverLoginButton;