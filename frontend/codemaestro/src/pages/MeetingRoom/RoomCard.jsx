import { FaLock } from "react-icons/fa";
import PropTypes from "prop-types";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

const RoomCard = ({
  title,
  entry_password,  // null이면 오픈방, 값이 있으면 비밀방
  thumbnail_url,
  participants,
  language,         // 단일 언어 (ENUM) 가정
  tags,
  id,              // PK
  is_active,       // 0: 종료된 방, 1: 활성화된 방
}) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    // 종료된 방(참여자 0 혹은 is_active가 0) 처리
    if (!is_active || !participants) {
      Swal.fire({
        title: "존재하지 않는(종료된) 회의실",
        text: "이미 종료되어 더 이상 입장할 수 없는 회의실입니다.",
        icon: "warning",
        confirmButtonText: "확인",
      });
      return;
    }

    // 비밀방/오픈방 상관없이 navigate
    Swal.fire({
      title: "회의실 입장",
      text: "회의실에 입장하는 기능이 추후 구현될 예정입니다.",
      icon: "success",
      confirmButtonText: "확인",
    }).then(() => {
      navigate(`/meeting/${id}`, {
        state: {
          isPrivate: !!entry_password,
        },
      });
    });
  };

  return (
    <div
      className="card w-64 bg-base-100 shadow-xl cursor-pointer"
      onClick={handleCardClick}
    >
      <figure className="relative">
        {/* 비밀번호가 있으면 자물쇠 표시 */}
        {entry_password && (
          <FaLock className="absolute right-2 top-2 text-red-500 text-xl" />
        )}
        <img
          src={thumbnail_url}
          alt="Room Thumbnail"
          className="w-full h-36 object-cover"
        />
      </figure>

      <div className="card-body p-4">
        {/* 방 이름 */}
        <h2 className="card-title text-lg font-bold">{title}</h2>

        {/* 인원 수 */}
        {participants !== undefined && participants > 0 && (
          <p className="text-sm text-gray-600">{participants}명 참여 중</p>
        )}

        {/* 언어 정보 */}
        {language && (
          <p className="text-xs text-gray-500">언어: {language}</p>
        )}

        {/* 태그 정보 */}
        {tags && tags.length > 0 && (
          <p className="text-xs text-gray-500">태그: {tags.join(", ")}</p>
        )}
      </div>
    </div>
  );
};

RoomCard.propTypes = {
  title: PropTypes.string.isRequired,
  entry_password: PropTypes.string,
  thumbnail_url: PropTypes.string,
  participants: PropTypes.number,
  language: PropTypes.string,
  tags: PropTypes.arrayOf(PropTypes.string),
  id: PropTypes.number.isRequired,
  is_active: PropTypes.oneOf([0, 1]),
};

export default RoomCard;
