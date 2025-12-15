import React from "react";
import ProfilePic from "./ProfilePic";
import {v4 as uuidv4} from "uuid";
import {Link} from "react-router-dom";
import type {Board, User} from "../../static/ts/mockData";

const mockToggleStar = async (board: Board): Promise<Board> => {
    return {...board, is_starred: !board.is_starred};
};

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

    return (
        <Link to={`/b/${board.id}`} className="board-preview">
            <button
                className={`board-preview__star${
                    board.is_starred ? " board-preview__star--starred" : ""
                }`}
                onClick={toggleFavorite}
            >
                {!board.is_starred ? (
                    <i className="fal fa-star"></i>
                ) : (
                    <i className="fas fa-star"></i>
                )}
            </button>

            {board.color ? (
                <div
                    className="board-preview__color"
                    style={{
                        backgroundColor: board.color.startsWith("#")
                            ? board.color
                            : `#${board.color}`,
                    }}
                />
            ) : board.image_url ? (
                <div className="board-preview__image">
                    <img
                        src={board.image_url}
                        alt={board.title}
                        loading="lazy"
                    />
                </div>
            ) : (
                <div className="board-preview__color board-preview__color--empty" />
            )}


            <p
                className="board-preview__title"
                style={{marginBottom: board.members ? "1em" : 0}}
            >
                {board.title}
            </p>

            {board.members && <Members members={board.members}/>}
        </Link>
    );
};

interface MembersProps {
    members: User[];
}

const Members: React.FC<MembersProps> = ({members}) => {
    return (
        <div className="board-preview__members">
            {members.slice(0, 3).map((member) => (
                <ProfilePic user={member} key={uuidv4()}/>
            ))}
            {members.length > 3 && (
                <p>{`+${members.length - 3} other${
                    members.length - 3 === 1 ? "" : "s"
                }`}</p>
            )}
        </div>
    );
};

export default HomeBoard;
