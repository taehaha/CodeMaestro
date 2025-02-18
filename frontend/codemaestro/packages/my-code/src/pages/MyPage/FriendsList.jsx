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
  const [isLoading, setIsLoading] = useState(false);
  const [isAddFriendModalOpen, setIsAddFriendModalOpen] = useState(false);
  const [checkedUsers, setCheckedUsers] = useState([]);

  const user = useSelector((state) => state.user.myInfo);
  const dispatch = useDispatch();
  const fetchfriends = useSelector((state) => state.user.friends);

  useEffect(() => {
    const fetchFriends = async () => {
      setIsLoading(true);
      try {
        await dispatch(getFriends(user.userId));
        setFriends(fetchfriends);
      } catch (error) {
        console.error("친구 정보를 가져오는 중 오류 발생:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchFriends();
  }, [dispatch, user.userId, fetchfriends]);

  const openAddFriendPage = () => {
    setIsAddFriendModalOpen(true);
  };

  if (isLoading) {
    return <LoadAnimation />;
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* 친구 목록 & 관리 버튼 컨테이너 */}
      <div className="flex flex-row flex-grow w-full p-4">
        {/* UserList (왼쪽) */}
        <div className="w-full md:w-4/5 overflow-auto">
          <UserList users={friends} checkedUsers={checkedUsers} setCheckedUsers={setCheckedUsers} />
        </div>

        {/* ManageFriend (오른쪽) */}
        <div className="w-1/5 flex justify-end">
        <div className="w-48 self-start">

          <ManageFriend openAddFriendPage={openAddFriendPage} checkedUsers={checkedUsers} />
        </div>
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
