import React, { use, useEffect, useState } from "react";
import UserList from "../../components/UserList";
import ManageFriend from "../Friend/ManageFriend";
import AddFriends from "../Friend/AddFriends";
import { getFriendsInfo } from "../../api/FriendApi";
import LoadAnimation from "../../components/LoadAnimation";
import { PropTypes } from "prop-types";
import { useDispatch, useSelector } from "react-redux";
import { getFriends } from "../../reducer/userSlice";
import "./FriendsList.css";
import { set } from "lodash";

const FriendsList = () => {
  const [friends, setFriends] = useState([]);
  const [isLoading, setIsLoading] = useState(false); // 로딩 상태 추가
  const [isAddFriendModalOpen, setIsAddFriendModalOpen] = useState(false);
  // UserList 체크 상태 관리
  const [checkedUsers, setCheckedUsers] = useState([]);
  const user = useSelector((state) => state.user.myInfo);
  const dispatch = useDispatch();
  const fetchfriends = useSelector((state) => state.user.friends);

  useEffect(() => {
    const fetchFriends = async () => {
      setIsLoading(true);
      try {
        await dispatch(getFriends(user.userId)); // 친구 목록 가져오기
        // dispatch가 완료된 후 상태를 가져와서 friends를 설정
        setFriends(fetchfriends); 
      } catch (error) {
        console.error("친구 정보를 가져오는 중 오류 발생:", error);
      } finally {
        setIsLoading(false);
      }
    };
  
    if (user.userId) {
      fetchFriends();
    }
  }, [dispatch, user.userId, fetchfriends]); // 의존성에 dispatch, user.userId, fetchfriends 추가
  

  // 친구 추가 모달 오픈 함수
  const openAddFriendPage = () => {
    setIsAddFriendModalOpen(true);
  };

  // 로딩 중일 때는 로딩 애니메이션을 표시
  if (isLoading) {
    return <LoadAnimation />;
  }

  return (
    <div>
      {/* <p className="header-style-border">친구 목록</p> */}
      <div className="flex flex-col md:flex-row">
        {/* UserList 영역 */}
        <div className="w-full md:w-4/5">
          <UserList
            users={friends}
            checkedUsers={checkedUsers}
            setCheckedUsers={setCheckedUsers}
          />
        </div>

        {/* ManageFriend 영역 */}
        <div className="w-full md:w-1/5 mt-4 md:mt-0 md:ml-4">
          <ManageFriend openAddFriendPage={openAddFriendPage} checkedUsers={checkedUsers} />
        </div>
      </div>

      {/* 친구 추가 모달 */}
      {isAddFriendModalOpen && (
        <div className="modal-overlay" onClick={() => setIsAddFriendModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <AddFriends onClose={() => setIsAddFriendModalOpen(false)} friends={friends}/>
          </div>
        </div>
      )}
    </div>
  );
};

export default FriendsList;
