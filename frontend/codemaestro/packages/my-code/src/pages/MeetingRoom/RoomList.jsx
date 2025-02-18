import PropTypes from "prop-types";
import RoomCard from "./RoomCard";

const RoomList = ({ rooms }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 p-4 overflow-y-auto max-h-[520px] w-[930px]">
      {rooms.map((room) => (
        <RoomCard
          key={room.conferenceId}
          conferenceId={room.conferenceId}
          title={room.title}
          isPassword={room.private}
          thumbnailUrl={room.thumbnailUrl}
          participantNum={room.participantNum}
          tagNameList={room.tagNameList}
          hostNickName={room.hostNickName}
          description={room.description}
        />
      ))}
    </div>
  );
};

RoomList.propTypes = {
  rooms: PropTypes.arrayOf(
    PropTypes.shape({
      /* 실제 DB 구조 */
      id: PropTypes.number.isRequired,
      hostNickName: PropTypes.number.isRequired,
      thumbnailUrl: PropTypes.string,
      title: PropTypes.string.isRequired,
      description: PropTypes.string,
      isPrivate: PropTypes.string,
      participantNum: PropTypes.number,
      tags: PropTypes.arrayOf(PropTypes.string),
    })
  ).isRequired,
};

export default RoomList;
