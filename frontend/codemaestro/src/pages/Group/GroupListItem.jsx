import Proptypes from 'prop-types';
import { useNavigate } from 'react-router-dom';

const GroupListItem = ({group}) => {
    const navigate = useNavigate()
    return(
        <li className="flex items-center py-4 px-6 cursor-pointer hover:brightness-75"
        onClick={()=>{navigate(`/group/${group.groupId}`)}} >
        <span className="text-gray-700 text-lg font-medium mr-4">{group.groupRanking}</span>
        <img className="w-12 h-12 rounded-full object-cover mr-4" src="https://randomuser.me/api/portraits/women/72.jpg"
            alt="User avatar"></img>
        <div className="flex-1">
            <h3 className="text-lg font-medium text-gray-800">{group.name}</h3>
            <p className="text-gray-600 text-base">{group.points} points</p>
        </div>
    </li>
    )
}


GroupListItem.propTypes = {
    group:Proptypes.objectOf(
        {
            name: Proptypes.string.isRequired,
            groupimage: Proptypes.string,
            groupRanking:Proptypes.number,
            point:Proptypes.number,
        })
}

export default GroupListItem
