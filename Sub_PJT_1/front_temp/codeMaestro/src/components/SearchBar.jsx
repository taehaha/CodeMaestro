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
            placeholder="검색어를 입력하세요" 
            className="p-2 rounded-sm flex-1 bg-slate-200  dark:bg-darkBoxColor"
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
    onRefresh: PropTypes.func.isRequired,
}
export default SearchBar