import PropTypes from 'prop-types';
import { FiEdit } from "react-icons/fi";

const MyProfileHeader = ({ user, openBackgroundEdit }) => {
  return (
    <div className="p-10 bg-gradient-to-r from-purple-500 to-amber-400 dark:text-darkText py-2 relative">
      {/* 배경과 프로필 이미지 겹치도록 조정 */}
      <div className="profile-header-content">
        {/* 프로필 이미지 섹션 */}
        <div className="profile-image-wrapper">
          <img 
            src={'/test_profile.png'}
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
    tier: PropTypes.number,
  }).isRequired,
  openEditPage: PropTypes.func.isRequired,
  openBackgroundEdit: PropTypes.func.isRequired,
};

export default MyProfileHeader;
