import Proptype from 'prop-types';

const FilteringBar = ({ items, onFilter, selectedItems }) => {


return(
    <div className="flex flex-wrap">
        {items.map((item) => (
            <button
                key={item}
                onClick={() => onFilter(item)}
                className={`px-3 py-2 rounded-3xl border text-xs mt-2 hover:brightness-75
                    ${selectedItems.includes(item)? 'bg-primaryHighlight dark:bg-darkHighlight' : ' dark:bg-darkText'}`}
            >{item}</button>))}  
    </div>
)
}

FilteringBar.propTypes = {
    items: Proptype.arrayOf(Proptype.string).isRequired,
    selectedItems: Proptype.arrayOf(Proptype.string).isRequired,
    onFilter: Proptype.func.isRequired,
}

export default FilteringBar;