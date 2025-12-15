import React, {useState} from "react";
import {Link} from "react-router-dom";

import AddBoardModal from "../modal/AddBoardModel";
import HomeBoard from "../boards/HomeBoard";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import {filterBoards} from "../../static/ts/board";

import {type Board, mockBoards,} from "../../static/ts/mockData";

const Home: React.FC = () => {
    useDocumentTitle("Boards | Trello");

    const [showAddBoardModal, setShowAddBoardModal] = useState(false);
    const [boardProject, setBoardProject] = useState<number>(0);
    const [boards, setBoards] = useState<Board[]>(mockBoards);

    const addBoard = (board: Board) => {
        setBoards((prev) => [...prev, board]);
    };

    const replaceBoard = (updated: Board) => {
        setBoards((prev) =>
            prev.map((b) => (b.id === updated.id ? updated : b))
        );
    };

    const [userBoards, projectBoards, starredBoards] =
        filterBoards(boards);

    return (
        <>
            <div className="home-wrapper">
                <div className="home">
                    {starredBoards.length !== 0 && (
                        <>
                            <div className="home__section">
                                <p className="home__title">
                                    <i className="fal fa-star"></i>{" "}
                                    Starred Boards
                                </p>
                            </div>
                            <div className="home__boards">
                                {starredBoards.map((board) => (
                                    <HomeBoard
                                        key={board.id}
                                        board={board}
                                        replaceBoard={replaceBoard}
                                    />
                                ))}
                            </div>
                        </>
                    )}

                    <div className="home__section">
                        <p className="home__title">
                            <i className="fal fa-user"></i>{" "}
                            Personal Boards
                        </p>
                        <button
                            className="btn"
                            onClick={() => {
                                setBoardProject(0);
                                setShowAddBoardModal(true);
                            }}
                        >
                            <i className="fal fa-plus"></i> Create
                        </button>
                    </div>

                    <div className="home__boards">
                        {userBoards.map((board) => (
                            <HomeBoard
                                key={board.id}
                                board={board}
                                replaceBoard={replaceBoard}
                            />
                        ))}
                    </div>

                    {projectBoards.map((project) => (
                        <React.Fragment key={project.id}>
                            <div className="home__section">
                                <p className="home__title">
                                    <i className="fal fa-users"></i>{" "}
                                    {project.title}
                                </p>
                                <div>
                                    <Link
                                        className="btn btn--secondary"
                                        to={`/p/${project.id}`}
                                    >
                                        Boards
                                    </Link>
                                    <a
                                        className="btn"
                                        onClick={() => {
                                            setBoardProject(project.id);
                                            setShowAddBoardModal(true);
                                        }}
                                    >
                                        <i className="fal fa-plus"></i>{" "}
                                        Create
                                    </a>
                                </div>
                            </div>

                            <div className="home__boards">
                                {project.boards.map((board: Board) => (
                                    <HomeBoard
                                        key={board.id}
                                        board={board}
                                        replaceBoard={replaceBoard}
                                    />
                                ))}
                            </div>
                        </React.Fragment>
                    ))}
                </div>
            </div>

            {showAddBoardModal && (
                <AddBoardModal
                    setShowAddBoardModal={setShowAddBoardModal}
                    addBoard={addBoard}
                    project={boardProject}
                />
            )}
        </>
    );
};

export default Home;
