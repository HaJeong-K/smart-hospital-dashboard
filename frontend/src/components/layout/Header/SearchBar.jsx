import { Search } from "lucide-react";

// className을 통해 기존 .toolbar-search 스타일(레이아웃 CSS에 이미 정의됨)을 재사용할 수 있다.
// 기본값도 반드시 스타일이 정의된 클래스여야 한다 — 과거에는 기본값이 "search-bar"였는데
// 정작 그 클래스는 CSS에 정의되어 있지 않아, className을 넘기지 않고 쓰면 스타일이 전혀
// 적용되지 않는 함정이 있었다.
function SearchBar({ value, onChange, placeholder = "병실, 환자 검색...", className = "toolbar-search" }) {
    return (
        <div className={className}>

            <Search size={18} />

            <input
                type="text"
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />

        </div>
    );
}

export default SearchBar;