import React from "react";
import ProfilePic from "./ProfilePic";
import {Link} from "react-router-dom";
import type {Board, User} from "../../static/ts/mockData";

const mockToggleStar = async (board: Board): Promise<Board> => ({
    ...board,
    is_starred: !board.is_starred,
});

interface HomeBoardProps {
    board: Board;
    replaceBoard: (board: Board) => void;
}

const HomeBoard: React.FC<HomeBoardProps> = ({board, replaceBoard}) => {
    const toggleFavorite = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        const updatedBoard = await mockToggleStar(board);
        replaceBoard(updatedBoard);
    };

    const bg = board.color
        ? {backgroundColor: board.color.startsWith("#") ? board.color : `#${board.color}`}
        : board.image_url
            ? {backgroundImage: `url(${board.image_url})`, backgroundSize: "cover", backgroundPosition: "center"}
            : {backgroundColor: "#6B7280"};

    return (
        <Link
            to={`/b/${board.id}`}
            className="relative rounded-lg overflow-hidden cursor-pointer group block"
            style={{...bg, minHeight: "96px"}}
        >
            {/* overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />

            {/* star button */}
            <button
                className={`absolute top-2 right-2 p-1 rounded transition-all z-10
                    ${board.is_starred
                        ? "text-yellow-400 opacity-100"
                        : "text-white/70 opacity-0 group-hover:opacity-100"
                    }`}
                onClick={toggleFavorite}
                aria-label={board.is_starred ? "Unstar board" : "Star board"}
            >
                <i className={board.is_starred ? "fas fa-star" : "fal fa-star"} />
            </button>

            {/* content */}
            <div className="absolute bottom-0 left-0 right-0 p-2">
                <p className="text-white font-semibold text-sm drop-shadow">
                    {board.title}
                </p>
                {board.members && <Members members={board.members}/>}
            </div>
        </Link>
    );
};

interface MembersProps {
    members: User[];
}

const Members: React.FC<MembersProps> = ({members}) => (
    <div className="flex items-center gap-1 mt-1">
        {members.slice(0, 3).map((member) => (
            <ProfilePic user={member} key={member.id}/>
        ))}
        {members.length > 3 && (
            <span className="text-white/80 text-xs">
                +{members.length - 3} other{members.length - 3 === 1 ? "" : "s"}
            </span>
        )}
    </div>
);

export default HomeBoard;
