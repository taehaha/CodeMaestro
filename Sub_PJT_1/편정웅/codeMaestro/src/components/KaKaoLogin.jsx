const KaKaoLoginButton = () => {

    const KAKAO_API = import.meta.env.KAKAO_API_KEY
    const KAKAO_REDIRECT = import.meta.env.KAKAO_REDIRECT_URL
    const URL_KAKAO = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_API}&redirect_uri=${KAKAO_REDIRECT}&response_type=code`
    
    const handleKakaoLogin = () => {
        window.location.href= URL_KAKAO
    }

    return(
        <button
        onClick={handleKakaoLogin}>
            테스트용 로그인
        </button>

    )
}

export default KaKaoLoginButton;