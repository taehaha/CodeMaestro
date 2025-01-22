import CreateMeetingForm from "./CreateMeetingForm"
import UserList from "../../components/UserList"
import { useState } from "react"
const CreateMeetingPage = () =>{
    const [checkedUsers, setCheckedUsers] = useState([]);
    return(
<div className="flex flex-col lg:flex-row gap-6 lg:gap-20 p-3 dark:text-darkText mx-auto max-w-screen-4xl">
    <div className="w-full lg:w-1/2">
        <header className="header-style">Invite Friend</header>
        <UserList
        checkedUsers={checkedUsers} setCheckedUsers={setCheckedUsers}
        />
    </div>
    <div className="w-full lg:w-1/2">
        <header className="header-style">회의 정보</header>
        <CreateMeetingForm 
        checkedUsers={checkedUsers}
        />
    </div>
    </div>
    )
}

export default CreateMeetingPage