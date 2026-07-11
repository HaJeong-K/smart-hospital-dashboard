import { Search } from "lucide-react";

function SearchBar({ value, onChange }) {
    return (
        <div className="search-bar">

            <Search size={18} />

            <input
                type="text"
                placeholder="병실, 환자 검색..."
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />

        </div>
    );
}

export default SearchBar;