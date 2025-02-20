import Proptypes from 'prop-types';
import { useNavigate } from 'react-router-dom';

const GroupItemRank = ({rank, group}) => {
    const navigate = useNavigate()
    return(
        <li className="flex items-center justify-between py-4 px-6 cursor-pointer hover:bg-[#f5f5f5]"
        onClick={()=>{navigate(`/group/${group.groupId}`)}} >
        <span className="text-gray-700 text-2xl font-medium">#{rank}</span>
            <h3 className="text-lg font-medium text-gray-800">{group.groupName}</h3>
        <span className="text-gray-700 text-lg font-medium">{Math.round(group.totalScore)} Point</span>

    </li>
    )
}


GroupItemRank.propTypes = {
    group:Proptypes.objectOf(
        {
            name: Proptypes.string.isRequired,
            groupRanking:Proptypes.number,
            point:Proptypes.number,
        })
}

export default GroupItemRank
