import React, {useContext, useEffect, useRef, useState} from "react";
import logo from "../../static/img/logo2.png";
import ProfilePic from "../boards/ProfilePic";
import {Link, type Location} from "react-router-dom";
import useBlurSetState from "../../hooks/useBlurSetState";
import {handleBackgroundBrightness} from "../../static/ts/util";
import globalContext, {type GlobalContextType} from "../../context/globalContext";

interface HeaderProps {
    location: Location;
}

const Header: React.FC<HeaderProps> = ({location}) => {
    const {authUser, board} =
        useContext<GlobalContextType>(globalContext);

    const [searchQuery, setSearchQuery] = useState<string>("");

    const searchElem = useRef<HTMLLIElement | null>(null);

    const [showNotifications, setShowNotifications] =
        useState<boolean>(false);

    useBlurSetState(
        ".label-modal",
        showNotifications,
        setShowNotifications
    );

    const onBoardPage = location.pathname.split("/")[1] === "b";

    const [isBackgroundDark, setIsBackgroundDark] =
        useState<boolean>(false);

    useEffect(
        handleBackgroundBrightness(board, setIsBackgroundDark),
        [board]
    );

    const userName =
        authUser?.full_name.replace(/ .*/, "") || "User";

    return (
        <>
            <header
                className={`header${
                    isBackgroundDark && onBoardPage
                        ? " header--transparent"
                        : ""
                }`}
            >
                <div className="header__section">
                    <ul className="header__list">
                        <li className="header__li">
                            <a>
                                <i className="fab fa-trello"/> Boards
                            </a>
                        </li>

                        <li
                            className={`header__li header__li--search${
                                searchQuery
                                    ? " header__li--active"
                                    : ""
                            }`}
                            ref={searchElem}
                        >
                            <i className="far fa-search"/>{" "}
                            <input
                                type="text"
                                placeholder="Search"
                                value={searchQuery}
                                onChange={(e) =>
                                    setSearchQuery(e.target.value)
                                }
                            />
                        </li>
                    </ul>
                </div>

                <div className="header__section">
                    <Link to="/">
                        <img
                            className="header__logo"
                            src={logo}
                            alt="Logo"
                        />
                    </Link>
                </div>

                <div className="header__section">
                    <ul className="header__list">
                        <li className="header__li header__li--profile">
                            <ProfilePic
                                user={authUser}
                                large={true}
                            />

                            <Link
                                to="/register"
                                className="header__user-link"
                            >
                                Hello, {userName}
                            </Link>
                        </li>
                    </ul>
                </div>

                <div className="out-of-focus"/>
            </header>
        </>
    );
};

export default Header;
