import React from "react";
import Swal from "sweetalert2";

const ManageFriend = ({openAddFriendPage, checkedUsers}) => {
    const handleDelete = ()=>{
        Swal.fire({
            title:"친구 삭제를 진행하시겠습니까?",
            text:"이 작업은 되돌릴 수 없습니다.",
            showCancelButton: true,
            confirmButtonText: '확인', 
            cancelButtonText: '취소',
            cancelButtonColor: '#B0BEC5',
        }).then((isConfirmed) => {
            if (isConfirmed) {
            checkedUsers.map((user) => {
                console.log(`${user.id} axios 보낸다`);
                
            })
            }
        })
    }
    return (
        <div className="flex flex-col justify-center items-center h-full">
            <button
             className="btn rounded-full w-40 mb-3 bg-primary text-white"
             onClick={openAddFriendPage}
            >새로운 친구 추가</button>
            <button
            className="btn rounded-full w-40 mb-3  bg-error text-white"
            onClick={handleDelete}
            >친구 삭제</button>
            <button className="btn rounded-full w-40 mb-3">디자인 눈물난다</button>
        </div>
    );
};

export default ManageFriend;
