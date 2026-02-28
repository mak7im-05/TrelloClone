import React, {useContext, useEffect, useRef, useState} from "react";
import type {DropResult} from "@hello-pangea/dnd";
import {DragDropContext, Draggable, Droppable} from "@hello-pangea/dnd";
import type {Item, List as ListType} from "../../static/ts/mockData";
import {mockBoards} from "../../static/ts/mockData";
import type {BoardFull} from "../../static/ts/mockData";
import globalContext from "../../context/globalContext";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import EditCardModal, {type CardFull} from "../modal/EditCardModal";

const MOCK_LISTS: ListType[] = [
    {
        id: "list-1",
        title: "To Do",
        order: "1",
        items: [
            {id: "card-1", title: "Research competitors", description: "Look at Trello, Asana, Linear", status: "todo", order: "1", list: "list-1"},
            {id: "card-2", title: "Design wireframes", description: "", status: "todo", order: "2", list: "list-1"},
        ],
    },
    {
        id: "list-2",
        title: "In Progress",
        order: "2",
        items: [
            {id: "card-3", title: "Build frontend", description: "React + Tailwind", status: "in_progress", order: "1", list: "list-2"},
        ],
    },
    {
        id: "list-3",
        title: "Done",
        order: "3",
        items: [
            {id: "card-4", title: "Setup Vite", description: "Configured build tooling", status: "done", order: "1", list: "list-3"},
        ],
    },
];

interface BoardProps {
    boardId: number;
}

const Board: React.FC<BoardProps> = ({boardId}) => {
    const [board, setBoard] = useState<BoardFull | null>(null);
    const {setBoard: setGlobalBoard} = useContext(globalContext);

    const [addingList, setAddingList] = useState(false);
    const [listTitle, setListTitle] = useState("");
    const listInputRef = useRef<HTMLInputElement>(null);

    const [activeCard, setActiveCard] = useState<{listId: string; card: CardFull} | null>(null);

    useEffect(() => {
        const found = mockBoards.find((b) => b.id === boardId);
        if (!found) return;

        setBoard({
            id: found.id,
            title: found.title,
            color: found.color,
            image_url: found.image_url,
            lists: JSON.parse(JSON.stringify(MOCK_LISTS)),
        });

        setGlobalBoard?.(found);
    }, [boardId, setGlobalBoard]);

    useDocumentTitle(board ? `${board.title} | Trello` : "Loading...");

    useEffect(() => {
        if (addingList) listInputRef.current?.focus();
    }, [addingList]);

    // ─── Board operations ─────────────────────────────────────────────────────

    const addList = () => {
        if (!board || !listTitle.trim()) return;
        setBoard({
            ...board,
            lists: [
                ...board.lists,
                {
                    id: `list-${Date.now()}`,
                    title: listTitle.trim(),
                    order: String(board.lists.length + 1),
                    items: [],
                },
            ],
        });
        setListTitle("");
        setAddingList(false);
    };

    const updateListTitle = (listId: string, title: string) => {
        if (!board || !title.trim()) return;
        setBoard({
            ...board,
            lists: board.lists.map((l) => (l.id === listId ? {...l, title} : l)),
        });
    };

    const deleteList = (listId: string) => {
        if (!board) return;
        setBoard({...board, lists: board.lists.filter((l) => l.id !== listId)});
    };

    const addCard = (listId: string, title: string) => {
        if (!board || !title.trim()) return;
        setBoard({
            ...board,
            lists: board.lists.map((l) =>
                l.id === listId
                    ? {
                        ...l,
                        items: [
                            ...l.items,
                            {
                                id: `card-${Date.now()}`,
                                title: title.trim(),
                                description: "",
                                status: "todo",
                                order: String(l.items.length + 1),
                                list: listId,
                            },
                        ],
                    }
                    : l
            ),
        });
    };

    const updateCard = (listId: string, updatedCard: Item) => {
        if (!board) return;
        setBoard({
            ...board,
            lists: board.lists.map((l) =>
                l.id === listId
                    ? {...l, items: l.items.map((c) => (c.id === updatedCard.id ? updatedCard : c))}
                    : l
            ),
        });
    };

    const deleteCard = (listId: string, cardId: string) => {
        if (!board) return;
        setBoard({
            ...board,
            lists: board.lists.map((l) =>
                l.id === listId ? {...l, items: l.items.filter((c) => c.id !== cardId)} : l
            ),
        });
    };

    const onDragEnd = (result: DropResult) => {
        if (!board) return;
        const {source, destination, type} = result;
        if (!destination) return;
        if (source.droppableId === destination.droppableId && source.index === destination.index) return;

        if (type === "list") {
            const lists = Array.from(board.lists);
            const [moved] = lists.splice(source.index, 1);
            lists.splice(destination.index, 0, moved);
            setBoard({...board, lists});
            return;
        }

        const lists = board.lists.map((l) => ({...l, items: [...l.items]}));
        const src = lists.find((l) => l.id === source.droppableId);
        const dst = lists.find((l) => l.id === destination.droppableId);
        if (!src || !dst) return;

        const [movedCard] = src.items.splice(source.index, 1);
        dst.items.splice(destination.index, 0, {...movedCard, list: dst.id});
        setBoard({...board, lists});
    };

    // ─── Board background ──────────────────────────────────────────────────────

    const boardStyle: React.CSSProperties = board?.image_url
        ? {backgroundImage: `url(${board.image_url})`, backgroundSize: "cover", backgroundPosition: "center"}
        : board?.color
            ? {backgroundColor: board.color.startsWith("#") ? board.color : `#${board.color}`}
            : {backgroundColor: "#0079bf"};

    if (!board) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{backgroundColor: "#0079bf"}}>
                <div className="text-white text-lg font-medium animate-pulse">Loading board...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-14" style={boardStyle}>
            {/* Board header */}
            <div className="px-4 py-3 bg-black/10 backdrop-blur-sm flex items-center gap-3">
                <h1 className="text-white font-bold text-lg drop-shadow">{board.title}</h1>
            </div>

            {/* Lists area */}
            <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="board" direction="horizontal" type="list">
                    {(provided) => (
                        <div
                            className="flex items-start gap-3 p-4 overflow-x-auto min-h-[calc(100vh-7rem)]"
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                        >
                            {board.lists.map((list, index) => (
                                <Draggable draggableId={list.id} index={index} key={list.id}>
                                    {(provided) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            className="flex-shrink-0"
                                        >
                                            <List
                                                list={list}
                                                dragHandleProps={provided.dragHandleProps}
                                                onAddCard={addCard}
                                                onRenameList={updateListTitle}
                                                onDeleteCard={deleteCard}
                                                onDeleteList={deleteList}
                                                onOpenCard={(item) =>
                                                    setActiveCard({
                                                        listId: list.id,
                                                        card: {
                                                            ...item,
                                                            labels: [],
                                                            attachments: [],
                                                            assigned_to: [],
                                                        },
                                                    })
                                                }
                                            />
                                        </div>
                                    )}
                                </Draggable>
                            ))}
                            {provided.placeholder}

                            {/* Add list form */}
                            {addingList ? (
                                <div className="flex-shrink-0 w-64 bg-gray-100 rounded-xl p-2 shadow">
                                    <input
                                        ref={listInputRef}
                                        value={listTitle}
                                        onChange={(e) => setListTitle(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") addList();
                                            if (e.key === "Escape") setAddingList(false);
                                        }}
                                        placeholder="List title"
                                        className="w-full px-3 py-2 rounded-lg border border-blue-400 outline-none text-sm mb-2 focus:ring-2 focus:ring-blue-200"
                                    />
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={addList}
                                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-1.5 rounded-lg transition-colors"
                                        >
                                            Add list
                                        </button>
                                        <button
                                            onClick={() => {
                                                setAddingList(false);
                                                setListTitle("");
                                            }}
                                            className="text-gray-500 hover:text-gray-800 text-lg w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-200 transition-colors"
                                        >
                                            ×
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setAddingList(true)}
                                    className="flex-shrink-0 w-64 bg-white/25 hover:bg-white/35 text-white text-sm font-medium px-3 py-2.5 rounded-xl text-left transition-colors backdrop-blur-sm"
                                >
                                    + Add another list
                                </button>
                            )}
                        </div>
                    )}
                </Droppable>
            </DragDropContext>

            {/* Card detail modal */}
            {activeCard && (() => {
                const list = board.lists.find((l) => l.id === activeCard.listId);
                if (!list) return null;
                return (
                    <EditCardModal
                        card={activeCard.card}
                        list={list}
                        onClose={() => setActiveCard(null)}
                        onSave={(updated) => {
                            updateCard(activeCard.listId, updated);
                            setActiveCard(null);
                        }}
                    />
                );
            })()}
        </div>
    );
};

// ─── List component ──────────────────────────────────────────────────────────

interface ListProps {
    list: ListType;
    dragHandleProps: any;
    onAddCard: (listId: string, title: string) => void;
    onRenameList: (listId: string, title: string) => void;
    onDeleteCard: (listId: string, cardId: string) => void;
    onDeleteList: (listId: string) => void;
    onOpenCard: (item: Item) => void;
}

const List: React.FC<ListProps> = ({
    list,
    dragHandleProps,
    onAddCard,
    onRenameList,
    onDeleteCard,
    onDeleteList,
    onOpenCard,
}) => {
    const [adding, setAdding] = useState(false);
    const [cardTitle, setCardTitle] = useState("");
    const [editingTitle, setEditingTitle] = useState(false);
    const [titleValue, setTitleValue] = useState(list.title);
    const cardInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (adding) cardInputRef.current?.focus();
    }, [adding]);

    const submitCard = () => {
        onAddCard(list.id, cardTitle);
        setCardTitle("");
        setAdding(false);
    };

    const submitTitle = () => {
        onRenameList(list.id, titleValue);
        setEditingTitle(false);
    };

    const statusDot: Record<string, string> = {
        todo: "bg-gray-400",
        in_progress: "bg-yellow-400",
        done: "bg-green-500",
    };

    return (
        <div className="w-64 bg-gray-100 rounded-xl shadow flex flex-col max-h-[calc(100vh-10rem)]">
            {/* List header */}
            <div
                className="flex items-center justify-between px-3 py-2.5 cursor-grab active:cursor-grabbing"
                {...dragHandleProps}
            >
                {editingTitle ? (
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            submitTitle();
                        }}
                        className="flex-1 mr-2"
                    >
                        <input
                            autoFocus
                            value={titleValue}
                            onChange={(e) => setTitleValue(e.target.value)}
                            onBlur={submitTitle}
                            className="w-full text-sm font-semibold px-2 py-1 rounded border border-blue-400 outline-none focus:ring-1 focus:ring-blue-300"
                        />
                    </form>
                ) : (
                    <span
                        className="font-semibold text-sm text-gray-800 cursor-text flex-1"
                        onClick={() => setEditingTitle(true)}
                    >
                        {list.title}
                    </span>
                )}
                <button
                    onClick={() => onDeleteList(list.id)}
                    className="text-gray-400 hover:text-red-500 w-6 h-6 flex items-center justify-center rounded hover:bg-gray-200 transition-colors ml-1 flex-shrink-0 text-sm"
                    title="Delete list"
                >
                    ✕
                </button>
            </div>

            {/* Cards */}
            <Droppable droppableId={list.id} type="card">
                {(provided, snapshot) => (
                    <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`flex flex-col gap-2 px-2 overflow-y-auto flex-1 transition-colors ${
                            snapshot.isDraggingOver ? "bg-blue-50" : ""
                        }`}
                        style={{minHeight: "8px"}}
                    >
                        {list.items.map((item, index) => (
                            <Draggable draggableId={item.id} index={index} key={item.id}>
                                {(provided, snapshot) => (
                                    <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        className={`group bg-white rounded-lg px-3 py-2 shadow-sm cursor-pointer hover:shadow-md transition-all border border-transparent hover:border-blue-200 ${
                                            snapshot.isDragging ? "shadow-lg rotate-1 border-blue-300" : ""
                                        }`}
                                        onClick={() => onOpenCard(item)}
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm text-gray-800 break-words">{item.title}</p>
                                                {item.description && (
                                                    <p className="text-xs text-gray-400 mt-0.5 truncate">{item.description}</p>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-1.5 flex-shrink-0">
                                                <span
                                                    className={`w-2 h-2 rounded-full flex-shrink-0 ${statusDot[item.status] ?? "bg-gray-400"}`}
                                                    title={item.status}
                                                />
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onDeleteCard(list.id, item.id);
                                                    }}
                                                    className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 text-sm w-5 h-5 flex items-center justify-center rounded transition-all"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </Draggable>
                        ))}
                        {provided.placeholder}
                        {list.items.length === 0 && !adding && (
                            <p className="text-xs text-gray-400 text-center py-3 italic">No cards yet</p>
                        )}
                    </div>
                )}
            </Droppable>

            {/* Add card */}
            <div className="px-2 pb-2 pt-1">
                {adding ? (
                    <div>
                        <input
                            ref={cardInputRef}
                            value={cardTitle}
                            onChange={(e) => setCardTitle(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") submitCard();
                                if (e.key === "Escape") {
                                    setAdding(false);
                                    setCardTitle("");
                                }
                            }}
                            placeholder="Card title..."
                            className="w-full border border-blue-400 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200 mb-2"
                        />
                        <div className="flex items-center gap-2">
                            <button
                                onClick={submitCard}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-1.5 rounded-lg transition-colors"
                            >
                                Add card
                            </button>
                            <button
                                onClick={() => {
                                    setAdding(false);
                                    setCardTitle("");
                                }}
                                className="text-gray-500 hover:text-gray-800 text-lg w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                ×
                            </button>
                        </div>
                    </div>
                ) : (
                    <button
                        onClick={() => setAdding(true)}
                        className="w-full text-left text-sm text-gray-500 hover:text-gray-800 hover:bg-gray-200 px-3 py-2 rounded-lg transition-colors"
                    >
                        + Add a card
                    </button>
                )}
            </div>
        </div>
    );
};

export default Board;
