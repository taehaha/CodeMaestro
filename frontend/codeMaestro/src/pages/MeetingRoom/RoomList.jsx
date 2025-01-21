import RoomCard from "./RoomCard";
import PropTypes from 'prop-types';
// 모바일 사이즈 col 12 , 데스크탑 col 6
// 리스트 정보 바탕으로, map으로 동적 roomcard 생성
// 누를 때 : 비밀번호 방이면 입력 창, 기존 방이면 절차 없이 >>> 입장
// 종료된 방이면 알림 생성 후 리로드 (현재는 모두 alret 처리)


const RoomList = ({rooms}) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4 overflow-y-auto max-h-[360px]">
            {rooms.map((room, index) => (
                    <RoomCard
                    key={index}
                    roomId={room.Id}
                    name={room.name}
                    isPassword={room.isPrivate}
                    thumbnail={room.thumbnail}
                    participants={room.participants}
                    languages={room.languages}
                    tag={room.tags}

                />
            ))}
        </div>
    )
};

RoomList.propTypes = {
    rooms: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string.isRequired,
        isPrivate: PropTypes.bool.isRequired,
        participants: PropTypes.number.isRequired,
        languages: PropTypes.arrayOf(PropTypes.string).isRequired,
        tags: PropTypes.arrayOf(PropTypes.string).isRequired,
        roomId: PropTypes.string
      })
    ).isRequired,
  };
  
  


export default RoomList;