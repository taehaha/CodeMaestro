import GroupListItem from "./GroupListItem";
import GroupItemRank from "./GroupItemRank";
import PropTypes from "prop-types";

const GroupList = ({ groups,
  type,       // 월 선택 state setter
}) => {
  return (
    <div className="overflow-hidden max-w-lg mx-auto mt-4 max-h-[450px] overflow-y-auto">
      <ul className="divide-y divide-gray-200">
        {groups.length === 0 ? (
          <div className="text-center py-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 text-slate-400 mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12h6m-3-3v6m6-9h.01M6 6h.01M18 18h.01M6 18h.01"
              />
            </svg>
            <h2 className="text-lg font-semibold text-slate-700">
              새로운 그룹을 추가해보세요.
            </h2>
          </div>
        ) : (
          groups.map((group, index) =>
            type === "ranking" ? (
              <GroupItemRank key={group.groupId} rank={index + 1} group={group} />
            ) : (
              <GroupListItem key={group.groupId} group={group} />
            )
          )
        )}
      </ul>
    </div>
  );
};

GroupList.propTypes = {
  groups: PropTypes.array.isRequired,
  type: PropTypes.string, // "ranking" 또는 다른 값을 받을 수 있습니다.
};

export default GroupList;
