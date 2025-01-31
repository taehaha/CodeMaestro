const GoogleLoginButton = () => {

    const GOOGLEO_API = import.meta.env.VITE_GOOGLE_API_KEY
    const GOOGLE_REDIRECT = import.meta.env.VITE_GOOGLE_REDIRECT_URL
    const URL_GOOGLE = `https://accounts.google.com/o/oauth2/v2/auth?scope=email%20openid&response_type=code&redirect_uri=${GOOGLE_REDIRECT}&client_id=${GOOGLEO_API}`
    
    const handleGoogleLogin = () => {
        window.location.href= URL_GOOGLE
    }

    return(
        <button
        onClick={handleGoogleLogin}>
            <img src={'/google.png'}></img>
        </button>

    )
}

export default GoogleLoginButton;