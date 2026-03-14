import React from "react";
import {Link} from "react-router-dom";
import type {BoardSummary} from "../../api/boards";

interface HomeBoardProps {
    board: BoardSummary;
    onToggleStar: () => void;
    onDelete: () => void;
}

const HomeBoard: React.FC<HomeBoardProps> = ({board, onToggleStar, onDelete}) => {
    const bg = board.color
        ? {backgroundColor: board.color.startsWith("#") ? board.color : `#${board.color}`}
        : board.imageUrl
            ? {backgroundImage: `url(${board.imageUrl})`, backgroundSize: "cover", backgroundPosition: "center"}
            : {backgroundColor: "#6B7280"};

    return (
        <Link
            to={`/b/${board.id}`}
            className="relative rounded-lg overflow-hidden cursor-pointer group block"
            style={{...bg, minHeight: "96px"}}
        >
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"/>

            {/* star button */}
            <button
                className={`absolute top-2 right-2 p-1 rounded transition-all z-10
                    ${board.isStarred
                        ? "text-yellow-400 opacity-100"
                        : "text-white/70 opacity-0 group-hover:opacity-100"
                    }`}
                onClick={(e) => {
                    e.preventDefault();
                    onToggleStar();
                }}
                aria-label={board.isStarred ? "Unstar board" : "Star board"}
            >
                <i className={board.isStarred ? "fas fa-star" : "fal fa-star"}/>
            </button>

            {/* delete button */}
            <button
                className="absolute top-2 left-2 p-1 rounded text-white/70 opacity-0 group-hover:opacity-100 hover:text-red-400 transition-all z-10"
                onClick={(e) => {
                    e.preventDefault();
                    if (confirm("Delete this board?")) onDelete();
                }}
                aria-label="Delete board"
            >
                <i className="fal fa-trash"/>
            </button>

            <div className="absolute bottom-0 left-0 right-0 p-2">
                <p className="text-white font-semibold text-sm drop-shadow">
                    {board.title}
                </p>
            </div>
        </Link>
    );
};

export default HomeBoard;
