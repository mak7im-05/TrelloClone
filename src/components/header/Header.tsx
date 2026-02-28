import {useContext, useEffect, useRef, useState} from "react";
import logo from "../../static/img/logo.png";
import ProfilePic from "../boards/ProfilePic";
import {Link, type Location} from "react-router-dom";
import {handleBackgroundBrightness} from "../../static/ts/util";
import globalContext, {type GlobalContextType} from "../../context/globalContext";
import SearchModal from "../modal/SearchModal";

interface HeaderProps {
    location: Location;
}

const Header: React.FC<HeaderProps> = ({location}) => {
    const {authUser, board} = useContext<GlobalContextType>(globalContext);

    const [searchQuery, setSearchQuery] = useState<string>("");
    const [showSearch, setShowSearch] = useState(false);
    const searchElem = useRef<HTMLDivElement | null>(null);

    const onBoardPage = location.pathname.split("/")[1] === "b";

    const [isBackgroundDark, setIsBackgroundDark] = useState<boolean>(false);

    useEffect(
        handleBackgroundBrightness(board, setIsBackgroundDark),
        [board]
    );

    const userName = authUser?.full_name.replace(/ .*/, "") || "User";

    const transparent = isBackgroundDark && onBoardPage;

    const headerBg = transparent
        ? "bg-black/20 backdrop-blur-sm"
        : "bg-[#0052cc]";

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-50 h-14 flex items-center px-3 gap-2 transition-colors ${headerBg}`}
        >
            {/* Left: logo + boards */}
            <div className="flex items-center gap-1 shrink-0">
                <Link to="/">
                    <img src={logo} alt="Trello" className="h-7 object-contain"/>
                </Link>
                <Link
                    to="/"
                    className="hidden sm:flex items-center gap-1 text-white/90 hover:text-white text-sm font-medium px-2 py-1 rounded hover:bg-white/10 transition-colors"
                >
                    <i className="fab fa-trello text-xs"/> Boards
                </Link>
            </div>

            {/* Center: search */}
            <div className="flex-1 flex justify-center px-2">
                <div className="relative w-full max-w-xs" ref={searchElem}>
                    <div className="flex items-center bg-white/20 hover:bg-white/30 focus-within:bg-white rounded-md transition-colors">
                        <i className="far fa-search text-white/70 pl-3 text-sm"/>
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setShowSearch(e.target.value.length > 0);
                            }}
                            onFocus={() => searchQuery && setShowSearch(true)}
                            onBlur={() => setTimeout(() => setShowSearch(false), 200)}
                            className="bg-transparent text-white placeholder-white/70 focus:text-gray-800 focus:placeholder-gray-400 text-sm py-1.5 px-2 outline-none w-full rounded-md"
                        />
                    </div>
                    {showSearch && (
                        <SearchModal
                            backendQuery={searchQuery}
                            searchElem={searchElem}
                            setShowModal={setShowSearch}
                        />
                    )}
                </div>
            </div>

            {/* Right: profile */}
            <div className="flex items-center gap-2 shrink-0">
                <Link
                    to="/register"
                    className="flex items-center gap-2 text-white/90 hover:text-white text-sm px-2 py-1 rounded hover:bg-white/10 transition-colors"
                >
                    <ProfilePic user={authUser} large/>
                    <span className="hidden sm:inline">Hello, {userName}</span>
                </Link>
            </div>

            {/* blur overlay for modals */}
            <div className="out-of-focus hidden fixed inset-0 z-40"/>
        </header>
    );
};

export default Header;
