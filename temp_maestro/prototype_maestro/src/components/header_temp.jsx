import { Link } from "react-router-dom"

const HeaderTemp = () => {
    return (
        <header className="bg-gray-700 fixed top-0 left-0 w-full flex py-2 justify-between items-center bg-darkBoxColor text-darkHighlight z-10">
            <img src="/Logo.png" alt="logo" className="h-3 mx-10" />
            <Link to="/create-meeting" className="text-xl mx-10  hover:brightness-75">
               CreatemeetingPage
            </Link>
            <Link to="/meeting" className="text-xl mx-10  hover:brightness-75">
                MeetingPage
            </Link>
            <Link to="/profile" className="text-xl mx-10  hover:brightness-75">
                ProfilePage
            </Link>
            {/* 실제로는 유저 닉네임과 연결되어야 함. */}
        </header>
    )
}

export default HeaderTemp