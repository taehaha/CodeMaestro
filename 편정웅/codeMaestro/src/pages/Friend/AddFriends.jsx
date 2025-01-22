import UserList from "../../components/UserList";
import { useState } from "react";
import { PropTypes } from "prop-types";

const AddFriends = ({onClose}) => {
    const [checkedUsers, setCheckedUsers] = useState([]) // checkedList 상태 관리
    
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
            addPage={true}
            ></UserList>
            <div className="flex justify-end gap-1">
            <button className="btn bg-error text-white" onClick={onClose}>닫기</button>
            </div>
            </div>
        </div>
    )
}

AddFriends.propTypes = {
    onClose:PropTypes.func.isRequired, // children은 반드시 전달되어야 함
  };

export default AddFriends