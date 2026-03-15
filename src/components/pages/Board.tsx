import React, {useContext, useEffect, useRef, useState} from "react";
import type {DropResult} from "@hello-pangea/dnd";
import {DragDropContext, Draggable, Droppable} from "@hello-pangea/dnd";
import globalContext from "../../context/globalContext";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import EditCardModal from "../modal/EditCardModal";
import {
    fetchBoard,
    createList,
    updateList,
    deleteList as apiDeleteList,
    reorderLists,
    createCard,
    updateCard as apiUpdateCard,
    deleteCard as apiDeleteCard,
    moveCard,
    reorderCards,
    fetchMembers,
    addMember,
    removeMember,
    type BoardFull,
    type ListResponse,
    type CardResponse,
    type MemberResponse,
} from "../../api/boards";

interface BoardProps {
    boardId: number;
}

const Board: React.FC<BoardProps> = ({boardId}) => {
    const [board, setBoard] = useState<BoardFull | null>(null);
    const [loading, setLoading] = useState(true);
    const {setBoard: setGlobalBoard} = useContext(globalContext);

    const [addingList, setAddingList] = useState(false);
    const [listTitle, setListTitle] = useState("");
    const listInputRef = useRef<HTMLInputElement>(null);

    const [activeCard, setActiveCard] = useState<{ listId: number; card: CardResponse } | null>(null);
    const [members, setMembers] = useState<MemberResponse[]>([]);
    const [showMembers, setShowMembers] = useState(false);
    const [inviteEmail, setInviteEmail] = useState("");

    useEffect(() => {
        setLoading(true);
        fetchBoard(boardId)
            .then((data) => {
                setBoard(data);
                setGlobalBoard?.({
                    id: data.id,
                    title: data.title,
                    is_starred: data.isStarred,
                    color: data.color ?? undefined,
                    image_url: data.imageUrl ?? undefined,
                });
            })
            .catch((err) => console.error("Failed to load board:", err))
            .finally(() => setLoading(false));
        fetchMembers(boardId).then(setMembers).catch(() => {});
    }, [boardId, setGlobalBoard]);

    useDocumentTitle(board ? `${board.title} | Trello` : "Loading...");

    useEffect(() => {
        if (addingList) listInputRef.current?.focus();
    }, [addingList]);

    // ─── List operations ──────────────────────────────────────────────────────

    const addList = async () => {
        if (!board || !listTitle.trim()) return;
        const newList = await createList(boardId, {title: listTitle.trim()});
        setBoard({...board, lists: [...board.lists, {...newList, cards: []}]});
        setListTitle("");
        setAddingList(false);
    };

    const updateListTitle = async (listId: number, title: string) => {
        if (!board || !title.trim()) return;
        await updateList(listId, {title});
        setBoard({
            ...board,
            lists: board.lists.map((l) => (l.id === listId ? {...l, title} : l)),
        });
    };

    const deleteList = async (listId: number) => {
        if (!board) return;
        await apiDeleteList(listId);
        setBoard({...board, lists: board.lists.filter((l) => l.id !== listId)});
    };

    // ─── Card operations ──────────────────────────────────────────────────────

    const addCard = async (listId: number, title: string) => {
        if (!board || !title.trim()) return;
        const newCard = await createCard(listId, {title: title.trim()});
        setBoard({
            ...board,
            lists: board.lists.map((l) =>
                l.id === listId ? {...l, cards: [...l.cards, newCard]} : l
            ),
        });
    };

    const handleUpdateCard = async (card: CardResponse) => {
        if (!board) return;
        const updated = await apiUpdateCard(card.id, {
            title: card.title,
            description: card.description ?? undefined,
            status: card.status,
        });
        setBoard({
            ...board,
            lists: board.lists.map((l) => ({
                ...l,
                cards: l.cards.map((c) => (c.id === updated.id ? updated : c)),
            })),
        });
    };

    const deleteCard = async (listId: number, cardId: number) => {
        if (!board) return;
        await apiDeleteCard(cardId);
        setBoard({
            ...board,
            lists: board.lists.map((l) =>
                l.id === listId ? {...l, cards: l.cards.filter((c) => c.id !== cardId)} : l
            ),
        });
    };

    // ─── Drag & Drop ──────────────────────────────────────────────────────────

    const onDragEnd = async (result: DropResult) => {
        if (!board) return;
        const {source, destination, type} = result;
        if (!destination) return;
        if (source.droppableId === destination.droppableId && source.index === destination.index) return;

        if (type === "list") {
            const lists = Array.from(board.lists);
            const [moved] = lists.splice(source.index, 1);
            lists.splice(destination.index, 0, moved);
            setBoard({...board, lists});
            await reorderLists(boardId, lists.map((l) => l.id));
            return;
        }

        // Card drag
        const lists = board.lists.map((l) => ({...l, cards: [...l.cards]}));
        const srcList = lists.find((l) => String(l.id) === source.droppableId);
        const dstList = lists.find((l) => String(l.id) === destination.droppableId);
        if (!srcList || !dstList) return;

        const [movedCard] = srcList.cards.splice(source.index, 1);
        dstList.cards.splice(destination.index, 0, {...movedCard, listId: dstList.id});
        setBoard({...board, lists});

        if (srcList.id === dstList.id) {
            await reorderCards(srcList.id, srcList.cards.map((c) => c.id));
        } else {
            await moveCard(movedCard.id, dstList.id, destination.index);
        }
    };

    // ─── Board background ──────────────────────────────────────────────────────

    const boardStyle: React.CSSProperties = board?.imageUrl
        ? {backgroundImage: `url(${board.imageUrl})`, backgroundSize: "cover", backgroundPosition: "center"}
        : board?.color
            ? {backgroundColor: board.color.startsWith("#") ? board.color : `#${board.color}`}
            : {backgroundColor: "#0079bf"};

    if (loading || !board) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{backgroundColor: "#0079bf"}}>
                <div className="text-white text-lg font-medium animate-pulse">Loading board...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-14" style={boardStyle}>
            <div className="px-4 py-3 bg-black/10 backdrop-blur-sm flex items-center gap-3">
                <h1 className="text-white font-bold text-lg drop-shadow">{board.title}</h1>
                <div className="ml-auto flex items-center gap-2">
                    {/* Member avatars */}
                    <div className="flex -space-x-2">
                        {members.slice(0, 5).map((m) => (
                            <div
                                key={m.userId}
                                className="w-8 h-8 rounded-full bg-blue-500 border-2 border-white/30 flex items-center justify-center text-white text-xs font-bold"
                                title={`${m.user.name || m.user.email} (${m.role})`}
                            >
                                {(m.user.name || m.user.email)[0].toUpperCase()}
                            </div>
                        ))}
                        {members.length > 5 && (
                            <div className="w-8 h-8 rounded-full bg-gray-500 border-2 border-white/30 flex items-center justify-center text-white text-xs font-bold">
                                +{members.length - 5}
                            </div>
                        )}
                    </div>
                    <div className="relative">
                        <button
                            onClick={() => setShowMembers(!showMembers)}
                            className="text-white/80 hover:text-white text-sm px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors"
                        >
                            <i className="fal fa-user-plus mr-1"/> Members
                        </button>
                        {showMembers && (
                            <div
                                className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 p-3"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Board Members</p>
                                <ul className="space-y-2 mb-3 max-h-48 overflow-y-auto">
                                    {members.map((m) => (
                                        <li key={m.userId} className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
                                                    {(m.user.name || m.user.email)[0].toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-800">{m.user.name || m.user.email}</p>
                                                    <p className="text-xs text-gray-400">{m.role}</p>
                                                </div>
                                            </div>
                                            {m.role !== 'admin' && (
                                                <button
                                                    onClick={async () => {
                                                        await removeMember(boardId, m.userId);
                                                        setMembers((prev) => prev.filter((x) => x.userId !== m.userId));
                                                    }}
                                                    className="text-gray-400 hover:text-red-500 text-xs"
                                                >
                                                    <i className="fal fa-times"/>
                                                </button>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                                <form
                                    onSubmit={async (e) => {
                                        e.preventDefault();
                                        if (!inviteEmail.trim()) return;
                                        try {
                                            const m = await addMember(boardId, inviteEmail.trim());
                                            setMembers((prev) => [...prev, m]);
                                            setInviteEmail("");
                                        } catch (err) {
                                            console.error(err);
                                        }
                                    }}
                                    className="flex gap-2"
                                >
                                    <input
                                        value={inviteEmail}
                                        onChange={(e) => setInviteEmail(e.target.value)}
                                        placeholder="Email"
                                        className="flex-1 border border-gray-200 rounded-lg px-2 py-1.5 text-sm outline-none focus:border-blue-400"
                                    />
                                    <button
                                        type="submit"
                                        className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg font-medium"
                                    >
                                        Add
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="board" direction="horizontal" type="list">
                    {(provided) => (
                        <div
                            className="flex items-start gap-3 p-4 overflow-x-auto min-h-[calc(100vh-7rem)]"
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                        >
                            {board.lists.map((list, index) => (
                                <Draggable draggableId={String(list.id)} index={index} key={list.id}>
                                    {(provided) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            className="flex-shrink-0"
                                        >
                                            <ListComponent
                                                list={list}
                                                dragHandleProps={provided.dragHandleProps}
                                                onAddCard={addCard}
                                                onRenameList={updateListTitle}
                                                onDeleteCard={deleteCard}
                                                onDeleteList={deleteList}
                                                onOpenCard={(card) => setActiveCard({listId: list.id, card})}
                                            />
                                        </div>
                                    )}
                                </Draggable>
                            ))}
                            {provided.placeholder}

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

            {activeCard && (
                <EditCardModal
                    card={activeCard.card}
                    listName={board.lists.find((l) => l.id === activeCard.listId)?.title ?? ""}
                    boardMembers={members}
                    onClose={() => setActiveCard(null)}
                    onSave={(updated) => {
                        handleUpdateCard(updated);
                        setActiveCard(null);
                    }}
                />
            )}
        </div>
    );
};

// ─── List component ──────────────────────────────────────────────────────────

interface ListComponentProps {
    list: ListResponse;
    dragHandleProps: any;
    onAddCard: (listId: number, title: string) => void;
    onRenameList: (listId: number, title: string) => void;
    onDeleteCard: (listId: number, cardId: number) => void;
    onDeleteList: (listId: number) => void;
    onOpenCard: (card: CardResponse) => void;
}

const ListComponent: React.FC<ListComponentProps> = ({
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

            <Droppable droppableId={String(list.id)} type="card">
                {(provided, snapshot) => (
                    <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`flex flex-col gap-2 px-2 overflow-y-auto flex-1 transition-colors ${
                            snapshot.isDraggingOver ? "bg-blue-50" : ""
                        }`}
                        style={{minHeight: "40px", paddingBottom: "8px"}}
                    >
                        {list.cards.map((card, index) => (
                            <Draggable draggableId={String(card.id)} index={index} key={card.id}>
                                {(provided, snapshot) => (
                                    <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        className={`group bg-white rounded-lg px-3 py-2 shadow-sm cursor-pointer hover:shadow-md transition-all border border-transparent hover:border-blue-200 select-none ${
                                            snapshot.isDragging ? "shadow-lg rotate-1 border-blue-300" : ""
                                        }`}
                                        style={{touchAction: "none"}}
                                        onClick={() => onOpenCard(card)}
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm text-gray-800 break-words">{card.title}</p>
                                                {card.description && (
                                                    <p className="text-xs text-gray-400 mt-0.5 truncate">{card.description}</p>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-1.5 flex-shrink-0">
                                                <span
                                                    className={`w-2 h-2 rounded-full flex-shrink-0 ${statusDot[card.status] ?? "bg-gray-400"}`}
                                                    title={card.status}
                                                />
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onDeleteCard(list.id, card.id);
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
                        {list.cards.length === 0 && !adding && (
                            <p className="text-xs text-gray-400 text-center py-3 italic">No cards yet</p>
                        )}
                    </div>
                )}
            </Droppable>

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
