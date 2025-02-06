import PropTypes from 'prop-types';
import "./Sidebar.css";

const Sidebar = ({ activeTab, setActiveTab }) => {
  return (
    <div className="sidebar">
      <ul className="sidebar-menu">
        <li 
          className={activeTab === "profile" ? "active" : ""}
          onClick={() => setActiveTab("profile")}
        >
          회원정보
        </li>
        <li>회의 녹화 리스트</li>
        <li>친구 목록</li>
        <li 
          className={activeTab === "group" ? "active" : ""}
          onClick={() => setActiveTab("group")}
        >
          그룹 목록
        </li>
      </ul>
    </div>
  );
};

Sidebar.PropTypes = {
  activeTab : PropTypes.string,
  setActiveTab : PropTypes.func,
}

export default Sidebar;
