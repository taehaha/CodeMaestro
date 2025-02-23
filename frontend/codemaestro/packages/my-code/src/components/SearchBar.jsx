import { useState } from "react";
import PropTypes from 'prop-types';
import { IoReloadCircle } from "react-icons/io5";
import { FaSearch } from "react-icons/fa";

const SearchBar = ({onSearch, onRefresh}) => {
    const [input, setInput] = useState('');

    const handleInput = (e) => {
        setInput(e.target.value);
    }

    const handleSearch = () => {        
        onSearch(input)
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
      };
      
    const handleReload = () => {
        onRefresh();
        }

    return (
<div className="w-full mx-auto flex items-center gap-2">
        <input 
            type="text" 
            placeholder="🔍︎ 검색어를 입력하세요." 
            className="w-[840px] border border-gray-300 p-2 rounded-md"
            onChange={handleInput}
            onKeyDown={handleKeyDown}
        />
        <button 
            onClick={handleSearch}
            className=" bg-[#ffcc00] hover:bg-[#f0cc00] dark:bg-darkHighlight p-2 rounded-md"
        >
            <FaSearch className="size-5"></FaSearch>
            {/* 검색 */}
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
    onRefresh: PropTypes.func.isRequired,
}
export default SearchBar