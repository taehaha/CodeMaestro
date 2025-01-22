import { useDispatch } from "react-redux";
import { signup } from "../api/AuthApi"
import { loginUser } from "../reducer/userSlice";

const MainPage = () => {
    const dispatch = useDispatch()
    const handlePost = async () => {
        const test = {
            email:"dd@dd.com",
            nickname:"asd",
            password:"1234asas",
            description:"1234asas"
        }
        console.log(test);
        const res = await signup(test)
        console.log(res);

    }
            
    const handleLogin = () => {
        const test = {
            username:"tt@tt",
            password:"tt",
        }
        const abc = dispatch(loginUser(test))
        return abc
    }
    
    return(
        <div className=" dark:text-darkText">
            메인페이지입니다, 오류 채우기 용이라 아무것도 없어요...
            <button className="btn" onClick={()=>{handlePost()}}>ㅎㅇㄱㅇ</button>
            <button className="btn" onClick={()=>{handleLogin()}}>ㄺㅇ</button>
        </div>
    )
}

export default MainPage;