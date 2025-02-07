import PropTypes from 'prop-types';
import { FiEdit } from "react-icons/fi";

const MyProfileHeader = ({ user, openBackgroundEdit }) => {
  return (
<div 
  className="p-10 py-2 relative text-darkText dark:text-darkText"
  style={{
    backgroundImage: `url(${user.profileBackgroundImageUrl})`,
    backgroundSize: "cover",
    backgroundPosition: "center"
  }}
>
  {/* 배경과 프로필 이미지 겹치도록 조정 */}
  <div className="profile-header-content">
    {/* 프로필 이미지 섹션 */}
    <div className="profile-image-wrapper">
      <img 
        src={user.profileImageUrl}
        alt="profile"
        className="profile-image"
      />
    </div>
  </div>

      {/* 배경 수정 버튼 */}
      <div className="absolute bottom-4 right-4 text-black" onClick={openBackgroundEdit}>
        <i className="fas fa-edit text-2xl cursor-pointer">
          <FiEdit />
        </i>
      </div>
    </div>
  );
};

MyProfileHeader.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string,

  }).isRequired,
  openEditPage: PropTypes.func.isRequired,
  openBackgroundEdit: PropTypes.func.isRequired,
};

export default MyProfileHeader;
