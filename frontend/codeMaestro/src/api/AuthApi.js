import UserAxios from "./userAxios";
import tokenStorage from "../utils/tokenstorage";
// *중요: 모든 주소는 api 요청 정해지면 수정될 수 있음!!!
// 현재 1월 17일 기준 

export const signup = async (payload) => {
    const response = await UserAxios.post("/auth/signup", payload)
    return response.data
}

export const signin = async (payload) => {
    const response = await UserAxios.post("/auth/signin", payload)
    return response.data
}

export const signout = async () => {
    const response = await UserAxios.post("/auth/signout")
    return response.data
}

// 아직 안정해진게 좀 있음(유저아이디 파라미터로 전해줄 것인가..)
// URL은 임시 URL 수정사항 있을시 URL만 바꿀 수 있도록 

// 2안
// export const getMyInfo = async () => {
//     const response = await UserAxios.get(`/profile/`,{
        // headers: {
        //     Authorization: `Bearer ${tokenStorage.getAccessToken()}`,
        //   },})
//     return response.data
// }

// 상세 정보는 바로 이렇게 쏘도록 설정.

export const getUserInfo = async () => {
    const response = await UserAxios.get(`/auth/profile`,{})
    return response.data
}
