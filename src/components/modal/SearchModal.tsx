import React, {type RefObject, useEffect, useMemo} from "react";
import {modalBlurHandler} from "../../static/ts/util";
import type {Board} from "../../static/ts/mockData";
import {mockBoards} from "../../static/ts/mockData";

interface SearchModalProps {
    backendQuery: string;
    searchElem: RefObject<HTMLElement>;
    setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
}

const getSearchSuggestionsPosition = (searchElem: RefObject<HTMLElement>) => {
    if (!searchElem?.current) return null;

    const rect = searchElem.current.getBoundingClientRect();
    return {
        top: rect.y + rect.height + 10 + "px",
        left: rect.x + "px",
    };
};

const SearchModal: React.FC<SearchModalProps> = ({
                                                     backendQuery,
                                                     searchElem,
                                                     setShowModal,
                                                 }) => {

    const normalizedQuery = backendQuery.trim().toLowerCase();

    const foundBoards: Board[] = useMemo(() => {
        if (!normalizedQuery) return [];

        return mockBoards.filter((board) =>
            board.title.toLowerCase().includes(normalizedQuery)
        );
    }, [normalizedQuery]);

    useEffect(() => {
        modalBlurHandler(setShowModal)();
    }, [setShowModal]);

    return (
        <div
            className="search-suggestions"
            style={getSearchSuggestionsPosition(searchElem) || undefined}
        >
            <p className="search-suggestions__title">Cards</p>

            <p className="search-suggestions__title">Boards</p>

            <ul className="search-suggestions__boards">
                {foundBoards.length ? (
                    foundBoards.map((board) => (
                        <li
                            key={board.id}
                            className="search-suggestions__board"
                        >
                            {board.title}
                        </li>
                    ))
                ) : (
                    <li className="search-suggestions__empty">
                        No boards found
                    </li>
                )}
            </ul>
        </div>
    );
};

export default SearchModal;
