import PropTypes from 'prop-types';

const UserDetail = ({ user, checkedUsers, setCheckedUsers,addPage }) => {
    
    const handleCheckboxChange = (isChecked) => {
        if (isChecked) {
            // 체크박스 체크 시 friend 추가
            setCheckedUsers([...checkedUsers, user]);
        } else {
            // 체크박스 체크 해제 시 friend 삭제
            setCheckedUsers(checkedUsers.filter((f) => f.id !== user.id));
        }
    }
 
    return(
        <li className="flex py-4 first:pt-0 last:pb-0">
        <img className="h-10 w-10 rounded-full" src={user.profileimage} alt="profile" />
        <div className="ml-3 overflow-hidden">
            <div>
             <span className="text-sm font-medium text-slate-900">{user.name}</span>
             <span className="text-xs ms-1 font-medium text-slate-500">@{user.id}</span>
            </div>
          <p className="text-sm text-slate-500 truncate">{user.profiletext}</p>
        </div>
            {!addPage && (            <div className="ml-auto my-auto">
            <input
                type="checkbox"
                className="checkbox dark:checkbox-warning rounded-sm"
                onChange={(e) => handleCheckboxChange(e.target.checked)}
            />
            </div>)}
      </li>
    )}


    UserDetail.propTypes = {
    invite:PropTypes.bool,
    user:PropTypes.objectOf(
        {
            name: PropTypes.string.isRequired,
            profileimage: PropTypes.string,
            profileText:PropTypes.string,
            id:PropTypes.string.isRequired,
        }
    ),
    checkedUsers:PropTypes.arrayOf,
    setCheckedUsers:PropTypes.func,
    addPage:PropTypes.bool,
     }; 
export default UserDetail