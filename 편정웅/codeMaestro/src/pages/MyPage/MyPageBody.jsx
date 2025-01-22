import FriendList from "../../components/UserList";
import ManageFriend from "../Friend/ManageFriend";
const MyPageBody = () => {
    return (
        <div className="flex">
        <p className="header-style-border">Friends</p>
        <FriendList></FriendList>
        <ManageFriend/>
        </div>
    )
}


export default MyPageBody;