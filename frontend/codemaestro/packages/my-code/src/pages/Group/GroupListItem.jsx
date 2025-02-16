import Proptypes from 'prop-types';
import { useNavigate } from 'react-router-dom';

const GroupListItem = ({group}) => {
    const navigate = useNavigate()
    return(
        <li className="flex items-center py-3 px-5 cursor-pointer hover:bg-[#F5F5F5] rounded-lg"
        onClick={()=>{navigate(`/group/${group.id}`)}} >
        <div className="flex-1">
            <h3 className="text-lg font-medium text-gray-800">{group.name}</h3>
            <span className=''>{group.currentMembers}/10</span>
        </div>
    </li>
    )
}


GroupListItem.propTypes = {
    group:Proptypes.objectOf(
        {
            name: Proptypes.string.isRequired,
            groupRanking:Proptypes.number,
            point:Proptypes.number,
        })
}

export default GroupListItem
