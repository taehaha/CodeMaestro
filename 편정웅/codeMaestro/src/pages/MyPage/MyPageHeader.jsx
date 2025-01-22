
import PropTypes from 'prop-types';
import { FiEdit } from "react-icons/fi";

// import { HexColorPicker } from 'react-colorful';


const MyPageHeader = ({user, openEditPage, openBackgroundEdit}) => {

    // 화면 구성 단계에서 여기 두고, 목표는 redux 전역 스토어로 옮기기 (실제 연결 시엔 axios만 짜면 바로 연결 가능하도록)


    return (
<div className="p-4 bg-gradient-to-r from-purple-500 to-amber-400 dark:text-darkText py-16 relative">
      <div className="flex flex-col md:flex-row items-center gap-4">
        {/* 프로필 이미지 섹션 */}
        <div className="flex-shrink-0">
          <img
            src={'/test_profile.png'}
            alt="profile"
            className="w-40 h-40 rounded-full bg-white object-cover"
          />
        </div>

        {/* 유저 정보 섹션 (오른쪽) */}
        <div>
          <p className="text-lg font-semibold">@{user.id}</p>
          <div className="flex items-center mt-2 space-x-2">
            <p className="text-xl font-bold">{user.name}</p>
            <img src={`/solvedac/${user.tier}.svg`} alt="tier" className='w-7'/>
            </div>
          <p className="text-sm mt-2">{user.description}</p>
          {/* 이 박스는 사용자한테만 보여요 or 남의 프로필은 애초에 못봐요 둘 중 하나 정해야 함. */}
            <button 
            className="btn me-3 mt-4 rounded-full"
            onClick={openEditPage}>
            프로필 수정
            </button>
          <div className="absolute bottom-4 right-4 text-black" onClick={openBackgroundEdit}>
            <i className="fas fa-edit text-2xl cursor-pointer">
              <FiEdit></FiEdit>
            </i>
          </div>
        </div>
      </div>
    </div>

    );
}
MyPageHeader.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string,
    tier: PropTypes.number,
    // profile_image_url : PropTypes.string,
  }).isRequired,
  openEditPage: PropTypes.func.isRequired,
  openBackgroundEdit: PropTypes.func.isRequired,
};

export default MyPageHeader;
