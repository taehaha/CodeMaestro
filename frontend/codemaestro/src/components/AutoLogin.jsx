import { useEffect, useState } from "react"
import tokenStorage from "../utils/tokenstorage"
import UserAxios from "../api/userAxios"
import { useNavigate } from "react-router-dom"
const AutoLogin = ({provider}) => {
    const [loading, setLoading] = useState(false)

    const navigate = useNavigate()
    //로그인 처리과정정
    const SocialLogin = async (code) =>{
        setLoading(true)
        try {
            const res = await UserAxios.post(
                `/oauth2/authorization/${provider}`,
                {code},
            )
            if (res.headers.accessToken) {
                tokenStorage.setAccessToken(res.headers.accessToken)
                navigate("/")
            }
        }
         catch (error) {
            console.error('로그인 실패', error);
            navigate("/login")
            
        } finally {
            setLoading(false)
        }}
    
    // 시작될 때 시행
    useEffect(()=>{
        // 로그인에 전달해줄 코드 갖고오기
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get("code");
        // 코드 있으면 axios 보내기
        if (code) {
            SocialLogin(code)
        }
        else {
            navigate("/")
        }

    },[navigate])

    return(loading ? <div>로그인 처리 중...</div> : null)
}

export default AutoLogin