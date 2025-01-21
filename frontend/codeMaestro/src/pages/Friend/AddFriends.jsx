import { divide } from "lodash"
import SearchBar from "../../components/SearchBar"
import UserList from "../../components/UserList";
import { useState } from "react";
const AddFriends = ({onClose}) => {
    const [checkedUsers, setCheckedUsers] = useState([]) // checkedList 상태 관리
    
    const handleSearch = (e)=>{
        console.log(e);
    }

    const handleAdd = ()=> {
        console.log(checkedUsers.map((user) => user.id));
    }

    return(


        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg shadow-md w-96">
            <p className="header-style">친구추가 페이지</p>
            <UserList
            checkedUsers={checkedUsers}
            setCheckedUsers={setCheckedUsers}
            addFage={true}
            ></UserList>
            <div className="flex justify-end gap-1">
            <button 
            className="btn bg-primary text-white"
            onClick={()=>{handleAdd()}}>추가</button>
            <button className="btn bg-error text-white" onClick={onClose}>취소</button>
            </div>
            </div>
        </div>
    )
}

export default AddFriends