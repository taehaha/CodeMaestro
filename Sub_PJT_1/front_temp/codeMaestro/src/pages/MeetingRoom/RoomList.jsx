import PropTypes from "prop-types";
import RoomCard from "./RoomCard";

const RoomList = ({ rooms }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4 overflow-y-auto max-h-[400px]">
      {rooms.map((room) => (
        <RoomCard
          key={room.id}
          id={room.id}
          title={room.title}
          entry_password={room.entry_password}
          thumbnail_url={room.thumbnail_url}
          participants={room.participants}
          language={room.language}
          tags={room.tags}
          is_active={room.is_active}
          owner_id={room.owner_id}
          description={room.description}
          url={room.url}
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
      owner_id: PropTypes.number.isRequired,
      thumbnail_url: PropTypes.string,
      title: PropTypes.string.isRequired,
      description: PropTypes.string,
      is_active: PropTypes.oneOf([0, 1]), // 0: 종료된 방, 1: 진행 중인 방
      url: PropTypes.string,
      entry_password: PropTypes.string,
      language: PropTypes.string,  // DB에 ENUM 형태로 저장 가정
      participants: PropTypes.number,
      tags: PropTypes.arrayOf(PropTypes.string),
    })
  ).isRequired,
};

export default RoomList;
