import React, {useEffect, useState} from "react";
import AddBoardModal from "../modal/AddBoardModel";
import HomeBoard from "../boards/HomeBoard";
import HomeSidebar from "../sidebars/HomeSidebar";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import {fetchBoards, createBoard, updateBoard, deleteBoard, type BoardSummary} from "../../api/boards";

const Home: React.FC = () => {
    useDocumentTitle("Boards | Trello");

    const [showAddBoardModal, setShowAddBoardModal] = useState(false);
    const [boards, setBoards] = useState<BoardSummary[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBoards()
            .then(setBoards)
            .catch((err) => console.error("Failed to load boards:", err))
            .finally(() => setLoading(false));
    }, []);

    const addBoard = async (data: { title: string; color?: string; imageUrl?: string }) => {
        const board = await createBoard(data);
        setBoards((prev) => [board, ...prev]);
    };

    const replaceBoard = (updated: BoardSummary) => {
        setBoards((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
    };

    const handleToggleStar = async (board: BoardSummary) => {
        const updated = await updateBoard(board.id, {isStarred: !board.isStarred});
        replaceBoard(updated);
    };

    const handleDeleteBoard = async (id: number) => {
        await deleteBoard(id);
        setBoards((prev) => prev.filter((b) => b.id !== id));
    };

    const starredBoards = boards.filter((b) => b.isStarred);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 pt-14 flex items-center justify-center">
                <div className="text-gray-400 text-lg animate-pulse">Loading boards...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pt-14">
            <div className="max-w-6xl mx-auto px-4 py-8 flex gap-8">
                <HomeSidebar projects={[]}/>

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
                                    <HomeBoard
                                        key={board.id}
                                        board={board}
                                        onToggleStar={() => handleToggleStar(board)}
                                        onDelete={() => handleDeleteBoard(board.id)}
                                    />
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
                                onClick={() => setShowAddBoardModal(true)}
                            >
                                <i className="fal fa-plus"/> Create
                            </button>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                            {boards.map((board) => (
                                <HomeBoard
                                    key={board.id}
                                    board={board}
                                    onToggleStar={() => handleToggleStar(board)}
                                    onDelete={() => handleDeleteBoard(board.id)}
                                />
                            ))}
                            <button
                                onClick={() => setShowAddBoardModal(true)}
                                className="rounded-lg bg-gray-200 hover:bg-gray-300 transition-colors flex items-center justify-center text-gray-500 text-sm font-medium"
                                style={{minHeight: "96px"}}
                            >
                                + Create new board
                            </button>
                        </div>
                    </section>
                </main>
            </div>

            {showAddBoardModal && (
                <AddBoardModal
                    setShowAddBoardModal={setShowAddBoardModal}
                    addBoard={addBoard}
                />
            )}
        </div>
    );
};

export default Home;
