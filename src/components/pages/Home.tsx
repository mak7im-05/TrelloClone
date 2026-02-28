import React, {useState} from "react";
import {Link} from "react-router-dom";

import AddBoardModal from "../modal/AddBoardModel";
import HomeBoard from "../boards/HomeBoard";
import HomeSidebar from "../sidebars/HomeSidebar";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import {filterBoards} from "../../static/ts/board";
import {type Board, mockBoards} from "../../static/ts/mockData";

const Home: React.FC = () => {
    useDocumentTitle("Boards | Trello");

    const [showAddBoardModal, setShowAddBoardModal] = useState(false);
    const [boardProject, setBoardProject] = useState<number>(0);
    const [boards, setBoards] = useState<Board[]>(mockBoards);

    const addBoard = (board: Board) => {
        setBoards((prev) => [...prev, board]);
    };

    const replaceBoard = (updated: Board) => {
        setBoards((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
    };

    const [userBoards, projectBoards, starredBoards] = filterBoards(boards);

    return (
        <div className="min-h-screen bg-gray-50 pt-14">
            <div className="max-w-6xl mx-auto px-4 py-8 flex gap-8">
                <HomeSidebar projects={projectBoards.map((p) => ({id: p.id, title: p.title}))}/>

                <main className="flex-1 min-w-0">
                    {/* Starred */}
                    {starredBoards.length > 0 && (
                        <section className="mb-8">
                            <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                                <i className="fal fa-star text-yellow-500"/>
                                Starred Boards
                            </h2>
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                                {starredBoards.map((board) => (
                                    <HomeBoard key={board.id} board={board} replaceBoard={replaceBoard}/>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Personal */}
                    <section className="mb-8">
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                <i className="fal fa-user"/>
                                Personal Boards
                            </h2>
                            <button
                                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium px-3 py-1.5 rounded-md hover:bg-blue-50 transition-colors"
                                onClick={() => {
                                    setBoardProject(0);
                                    setShowAddBoardModal(true);
                                }}
                            >
                                <i className="fal fa-plus"/> Create
                            </button>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                            {userBoards.map((board) => (
                                <HomeBoard key={board.id} board={board} replaceBoard={replaceBoard}/>
                            ))}
                            {/* Create new board tile */}
                            <button
                                onClick={() => {
                                    setBoardProject(0);
                                    setShowAddBoardModal(true);
                                }}
                                className="rounded-lg bg-gray-200 hover:bg-gray-300 transition-colors flex items-center justify-center text-gray-500 text-sm font-medium"
                                style={{minHeight: "96px"}}
                            >
                                + Create new board
                            </button>
                        </div>
                    </section>

                    {/* Project boards */}
                    {projectBoards.map((project) => (
                        <section key={project.id} className="mb-8">
                            <div className="flex items-center justify-between mb-3">
                                <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                    <i className="fal fa-users"/>
                                    {project.title}
                                </h2>
                                <div className="flex items-center gap-2">
                                    <Link
                                        className="text-xs text-gray-600 hover:text-gray-900 font-medium px-3 py-1.5 rounded-md hover:bg-gray-100 transition-colors"
                                        to={`/p/${project.id}`}
                                    >
                                        Boards
                                    </Link>
                                    <button
                                        className="text-xs text-blue-600 hover:text-blue-800 font-medium px-3 py-1.5 rounded-md hover:bg-blue-50 transition-colors"
                                        onClick={() => {
                                            setBoardProject(project.id);
                                            setShowAddBoardModal(true);
                                        }}
                                    >
                                        <i className="fal fa-plus"/> Create
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                                {project.boards.map((board: Board) => (
                                    <HomeBoard key={board.id} board={board} replaceBoard={replaceBoard}/>
                                ))}
                            </div>
                        </section>
                    ))}
                </main>
            </div>

            {showAddBoardModal && (
                <AddBoardModal
                    setShowAddBoardModal={setShowAddBoardModal}
                    addBoard={addBoard}
                    project={boardProject}
                />
            )}
        </div>
    );
};

export default Home;
