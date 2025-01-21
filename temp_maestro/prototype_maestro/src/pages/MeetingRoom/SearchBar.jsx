import { useState } from "react";
import PropTypes from 'prop-types';
import { IoReloadCircle } from "react-icons/io5";
import { FaSearch } from "react-icons/fa";

const SearchBar = ({onSearch}) => {
    const [input, setInput] = useState('');

    const handleInput = (e) => {
        setInput(e.target.value);
    }

    const handleSearch = () => {        
        onSearch(input)
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSearch(); // 작성한 댓글 post 요청하는 함수 
        }
      };
      
    const handleReload = () => {
        console.log("방 정보를 다시 불러오는 함수");
    }

    return (
<div className="w-full flex items-center gap-2">
        <input 
            type="text" 
            placeholder="검색어를 입력하세요" 
            className="p-2 rounded-sm flex-1 bg-primaryBoxcolor  dark:bg-darkBoxColor"
            onChange={handleInput}
            onKeyDown={handleKeyDown}
        />
        <button 
            onClick={handleSearch}
            className=" bg-primaryHighlight dark:bg-darkHighlight p-2 rounded-sm"
        >
            <FaSearch className="size-6"></FaSearch>
        </button>
        <button
        onClick={()=>{handleReload()}}
        className="hover:brightness-75"
        ><IoReloadCircle className="size-10"></IoReloadCircle></button>

        </div>
    )
}

SearchBar.propTypes = {
    onSearch: PropTypes.func.isRequired,
    setRooms: PropTypes.func.isRequired,
}
export default SearchBar