import { FaLock } from "react-icons/fa";
import PropTypes from "prop-types";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

const RoomCard = ({
  conferenceId,   // PK
  title,
  description,
  isPassword,     // null이면 오픈방, 값이 있으면 비밀방
  thumbnailUrl,
  participantNum, // 현재 참여 인원 수
  tagNameList,    // 태그 목록
  hostNickName,   // 호스트(방장) 닉네임
}) => {
  const navigate = useNavigate();


  const handleCardClick = () => {
    console.log(isPassword);
    
    // 인원이 10명을 초과하면 입장 불가
    if (participantNum > 10) {
      Swal.fire({
        title: "최대 인원",
        text: "최대 인원이 입장하여 더 이상 입장할 수 없습니다.",
        icon: "warning",
        confirmButtonText: "확인",
      });
      return;
    }

    // 입장 로직
    Swal.fire({
      title: "스터디 입장",
      icon: "success",
      iconColor:"#5FD87D",
      width: "500px",
      background: "#f8f9fa",
      confirmButtonColor: "#FFCC00",
      confirmButtonText: "확인",
      customClass: {
        popup: "swal-custom-popup",       // 전체 팝업 스타일
        title: "swal-custom-title",       // 제목 스타일
        htmlContainer: "swal-custom-text", // 본문 텍스트 스타일
        confirmButton: "swal-custom-button" // 버튼 스타일
      }
    }).then(() => {
      navigate(`/meeting/${conferenceId}`, {
        state: {
          isPrivate: isPassword,
        },
      });
    });
  };

  return (
    <div
      className="card w-72 bg-base-100 shadow-xl rounded-sm cursor-pointer"
      onClick={handleCardClick}
    >
      <figure className="relative w-full h-36">
        {/* 비밀번호가 있으면 자물쇠 표시 */}
        {isPassword && (
          <FaLock className="absolute right-2 top-2 text-red-500 text-xl" />
        )}
        <img
          src={thumbnailUrl}
          alt="Room Thumbnail"
          className="w-100% h-100% object-cover"
        />
      </figure>

      <div className="card-body p-4">
        {/* 방 제목 */}
        <h2 className="card-title text-lg font-bold p-2 mx-auto border-b-2">{title}</h2>
        {/* 방 설명 */}
        {description && (
          <p className="text-sm text-gray-500 my-2 line-clamp-2">
            {description}
          </p>
        )}


        {/* 호스트 닉네임 */}
        {hostNickName && (
          <p className="text-sm text-gray-600">개최자: {hostNickName}</p>
        )}

        {/* 인원 수 */}
        {typeof participantNum === "number" && (
          <p className="text-sm text-black mb-2 absolute bottom-2 right-2">
            {participantNum}/10
          </p>
        )}

        {/* 태그 정보 */}
        {Array.isArray(tagNameList) && tagNameList.length > 0 && (
          <p className="text-xs text-gray-500 pt-2">
            태그:{" "}
            {tagNameList.map((tag, index) => (
              <span
                key={index}
                className="inline-block border border-gray-200 px-2 py-1 m-1"
                onClick={() => 
                  
                  {

                    handleTagClick(tag)}}
              >
                {tag}
              </span>
            ))}
          </p>
        )}
      </div>
    </div>
  );
};

RoomCard.propTypes = {
  conferenceId: PropTypes.number.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  isPassword: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.oneOf([null]), // null이면 오픈방
  ]),
  thumbnailUrl: PropTypes.string,
  participantNum: PropTypes.number,
  tagNameList: PropTypes.arrayOf(PropTypes.string),
  hostNickName: PropTypes.string,
  selectTag: PropTypes.func,
};

export default RoomCard;
