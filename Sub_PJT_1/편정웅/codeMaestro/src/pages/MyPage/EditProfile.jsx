import { useSelector } from 'react-redux';
import { PropTypes } from "prop-types";

const EditProfile = ({onClose}) => {
    const user = useSelector((state) => state.user.myInfo); 
    return (
        <div className="bg-primaryBoxcolor dark:bg-darkBoxColor dark:text-darkText rounded-sm shadow-lg w-full max-w-md p-6 ">
            <div className="flex justify-between items-center border-b pb-2 mb-4">
                  <h2 className="text-lg font-semibold">프로필 수정</h2>
                  <button
                    onClick={onClose} // 닫기 버튼
                    className="text-black hover:text-gray-800 text-2xl"
                  >
                    &times;
                  </button>
                </div>
            EditProfile 컴포넌트
                    <p>{user.nickname}</p>
                    {user.email}
                     </div>

    )
}

EditProfile.propTypes = {
    onClose:PropTypes.func.isRequired, // children은 반드시 전달되어야 함
  };

export default EditProfile;