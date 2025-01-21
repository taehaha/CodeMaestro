import { useSelector } from 'react-redux';

const EditProfile = () => {
    const user = useSelector((state) => state.user.myInfo); 
    return (
        <div> EditProfile 컴포넌트
                    <p>{user.nickname}</p>
                    {user.email}
                     </div>

    )
}

export default EditProfile;