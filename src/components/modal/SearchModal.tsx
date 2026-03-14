import React, {useEffect, useMemo, useState} from "react";
import {Link} from "react-router-dom";
import {fetchBoards, type BoardSummary} from "../../api/boards";

interface SearchModalProps {
    backendQuery: string;
    searchElem: React.RefObject<HTMLElement | null>;
    setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
}

const SearchModal: React.FC<SearchModalProps> = ({backendQuery}) => {
    const [boards, setBoards] = useState<BoardSummary[]>([]);

    useEffect(() => {
        fetchBoards().then(setBoards).catch(() => {});
    }, []);

    const normalizedQuery = backendQuery.trim().toLowerCase();

    const foundBoards = useMemo(() => {
        if (!normalizedQuery) return [];
        return boards.filter((board) =>
            board.title.toLowerCase().includes(normalizedQuery)
        );
    }, [normalizedQuery, boards]);

    return (
        <div className="absolute top-full mt-2 left-0 right-0 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50">
            <div className="px-3 py-2 border-b border-gray-100">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Boards</p>
            </div>

            {foundBoards.length > 0 ? (
                <ul>
                    {foundBoards.map((board) => {
                        const bg = board.color
                            ? {backgroundColor: board.color.startsWith("#") ? board.color : `#${board.color}`}
                            : board.imageUrl
                                ? {backgroundImage: `url(${board.imageUrl})`, backgroundSize: "cover"}
                                : {backgroundColor: "#6B7280"};

                        return (
                            <li key={board.id}>
                                <Link
                                    to={`/b/${board.id}`}
                                    className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 transition-colors"
                                >
                                    <span
                                        className="w-8 h-6 rounded flex-shrink-0"
                                        style={bg}
                                    />
                                    <span className="text-sm text-gray-800">{board.title}</span>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            ) : (
                <p className="px-3 py-4 text-sm text-gray-400 text-center">
                    No boards found for &ldquo;{backendQuery}&rdquo;
                </p>
            )}
        </div>
    );
};

export default SearchModal;
