import UserDetail from "./UserDetail"
import SearchBar from "./SearchBar"
import PropTypes from 'prop-types';
import { useState } from "react";


const UserList = ({checkedUsers, setCheckedUsers, addPage}) => {
    const [searchTerm, setSearchTerm] = useState('')
    
    const tempList=[
        {name:'김친구', id:"friends1",profileimage:'/test_profile.png',profiletext:'백엔드 연결 전 친구 테스트용'},
        {name:'박친구', id:"friends2",profileimage:'/test_profile.png',profiletext:'실제 백엔드 연결시엔'},
        {name:'이친구', id:"friends3",profileimage:'/test_profile.png',profiletext:'이 리스트 컴포넌트에'},
        {name:'제갈친구', id:"friends4",profileimage:'/test_profile.png',profiletext:'검색한 유저와 친구 목록이'},
        {name:'밥친구', id:"friends5",profileimage:'/test_profile.png',profiletext:'유동적으로 들어갑니다.'},
        {name:'김친구', id:"friends1",profileimage:'/test_profile.png',profiletext:'백엔드 연결 전 친구 테스트용'},
        {name:'박친구', id:"friends2",profileimage:'/test_profile.png',profiletext:'실제 백엔드 연결시엔'},
    ]



const handleSearch = (input) => {
    console.log(input);
    setSearchTerm(input)
}

const fillteredUsers = tempList.filter((user) => {
    const matchName = user.name.includes(searchTerm);
    const matchId = user.id.includes(searchTerm);
    return matchName || matchId
  })

const handleRefresh = () => {
    console.log('상위 함수가 원하는 유저리스트를 불러오기');
    
}

// 친구초대 관련 리스트    
    return(
        <>
        <SearchBar
        onSearch={(input) => handleSearch(input)}
        onRefresh={()=>{handleRefresh()}}/>
        <ul role="list" className="p-6 divide-y divide-slate-200 overflow-y-auto max-h-[220px] mt-3">
            {fillteredUsers.map((user, index) => (
                <UserDetail
                    key={index}
                    user={user}
                    checkedUsers={checkedUsers}
                    setCheckedUsers={setCheckedUsers}
                    addPage={addPage}
                />
                ))
            }
        </ul>
        </>

    )}

UserList.PropTypes  = {
    checkedUsers:PropTypes.array,
    setCheckedUsers:PropTypes.func,
    addPage:PropTypes.bool,
}
export default UserList