import React, {useContext, useEffect, useState} from "react";
import type {DropResult} from "react-beautiful-dnd";
import {DragDropContext, Draggable, Droppable} from "react-beautiful-dnd";
import type {BoardFull, List as ListType} from "../../static/ts/mockData";
import {mockBoards} from "../../static/ts/mockData";
import globalContext, {type GlobalContextType} from "../../context/globalContext";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import "../../static/css/board.css";

const mockLists: ListType[] = [
    {
        id: "list-1",
        title: "To Do",
        order: "1",
        items: [
            {
                id: "card-1",
                title: "Task 1",
                description: "",
                status: "todo",
                order: "1",
                list: "list-1",
            },
        ],
    },
    {id: "list-2", title: "In Progress", order: "2", items: []},
    {id: "list-3", title: "Done", order: "3", items: []},
];

interface BoardProps {
    boardId: number;
}

const Board: React.FC<BoardProps> = ({boardId}) => {
    const [board, setBoard] = useState<BoardFull | null>(null);
    const {setBoard: setGlobalBoard} =
        useContext<GlobalContextType>(globalContext);

    const [addingList, setAddingList] = useState(false);
    const [listTitle, setListTitle] = useState("");

    const [activeCard, setActiveCard] = useState<{
        listId: string;
        card: any;
    } | null>(null);

    useEffect(() => {
        const found = mockBoards.find((b) => b.id === boardId);
        if (!found) return;

        setBoard({
            id: found.id,
            title: found.title,
            lists: JSON.parse(JSON.stringify(mockLists)),
        });

        setGlobalBoard?.(found);
    }, [boardId, setGlobalBoard]);

    useDocumentTitle(board ? `${board.title} | Trello` : "Loading...");

    const addList = (title: string) => {
        if (!board || !title.trim()) return;

        setBoard({
            ...board,
            lists: [
                ...board.lists,
                {
                    id: `list-${Date.now()}`,
                    title,
                    order: String(board.lists.length + 1),
                    items: [],
                },
            ],
        });
    };

    const updateListTitle = (listId: string, title: string) => {
        if (!board || !title.trim()) return;

        setBoard({
            ...board,
            lists: board.lists.map((l) =>
                l.id === listId ? {...l, title} : l
            ),
        });
    };

    const deleteList = (listId: string) => {
        if (!board) return;

        setBoard({
            ...board,
            lists: board.lists.filter((l) => l.id !== listId),
        });
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
                                id: Date.now().toString(),
                                title,
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

    const updateCard = (listId: string, updatedCard: any) => {
        if (!board) return;

        setBoard({
            ...board,
            lists: board.lists.map((l) =>
                l.id === listId
                    ? {
                        ...l,
                        items: l.items.map((c) =>
                            c.id === updatedCard.id ? updatedCard : c
                        ),
                    }
                    : l
            ),
        });
    };

    const deleteCard = (listId: string, cardId: string) => {
        if (!board) return;

        setBoard({
            ...board,
            lists: board.lists.map((l) =>
                l.id === listId
                    ? {
                        ...l,
                        items: l.items.filter((c) => c.id !== cardId),
                    }
                    : l
            ),
        });
    };

    const onDragEnd = (result: DropResult) => {
        if (!board) return;
        const {source, destination, type} = result;
        if (!destination) return;
        if (
            source.droppableId === destination.droppableId &&
            source.index === destination.index
        )
            return;

        if (type === "list") {
            const lists = Array.from(board.lists);
            const [moved] = lists.splice(source.index, 1);
            lists.splice(destination.index, 0, moved);
            setBoard({...board, lists});
            return;
        }

        const lists = board.lists.map((l) => ({
            ...l,
            items: [...l.items],
        }));

        const sourceList = lists.find((l) => l.id === source.droppableId);
        const destinationList = lists.find(
            (l) => l.id === destination.droppableId
        );
        if (!sourceList || !destinationList) return;

        const [movedCard] = sourceList.items.splice(source.index, 1);
        destinationList.items.splice(destination.index, 0, {
            ...movedCard,
            list: destinationList.id,
        });

        setBoard({...board, lists});
    };

    if (!board) return <div className="board">Loading...</div>;

    return (
        <div className="board">
            <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="board" direction="horizontal" type="list">
                    {(provided) => (
                        <div
                            className="board__lists"
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                        >
                            {board.lists.map((list, index) => (
                                <Draggable draggableId={list.id} index={index} key={list.id}>
                                    {(provided) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}
                                            className="list-wrapper"
                                        >
                                            <List
                                                list={list}
                                                onAddCard={addCard}
                                                onRenameList={updateListTitle}
                                                onDeleteCard={deleteCard}
                                                onDeleteList={deleteList}
                                                onOpenCard={(card) =>
                                                    setActiveCard({listId: list.id, card})
                                                }
                                            />
                                        </div>
                                    )}
                                </Draggable>
                            ))}
                            {provided.placeholder}

                            {addingList ? (
                                <div className="list-add-form">
                                    <input
                                        autoFocus
                                        value={listTitle}
                                        onChange={(e) => setListTitle(e.target.value)}
                                    />
                                    <button
                                        onClick={() => {
                                            addList(listTitle);
                                            setListTitle("");
                                            setAddingList(false);
                                        }}
                                    >
                                        Add list
                                    </button>
                                </div>
                            ) : (
                                <button className="list-add" onClick={() => setAddingList(true)}>
                                    + Add another list
                                </button>
                            )}
                        </div>
                    )}
                </Droppable>
            </DragDropContext>

            {activeCard && (
                <CardModal
                    card={activeCard.card}
                    onClose={() => setActiveCard(null)}
                    onSave={(updated) => {
                        updateCard(activeCard.listId, updated);
                        setActiveCard(null);
                    }}
                />
            )}
        </div>
    );
};

const List = ({list, onAddCard, onRenameList, onDeleteCard, onDeleteList, onOpenCard}: any) => {
    const [adding, setAdding] = useState(false);
    const [cardTitle, setCardTitle] = useState("");

    return (
        <div className="list">
            <div className="list__header">
                <div className="list__title">{list.title}</div>
                <button onClick={() => onDeleteList(list.id)}>✕</button>
            </div>

            <Droppable droppableId={list.id} type="card">
                {(provided) => (
                    <div ref={provided.innerRef} {...provided.droppableProps} className="list__cards">
                        {list.items.map((item: any, index: number) => (
                            <Draggable draggableId={item.id} index={index} key={item.id}>
                                {(provided) => (
                                    <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        className="card"
                                        onClick={() => onOpenCard(item)}
                                    >
                                        {item.title}
                                        <button onClick={(e) => {
                                            e.stopPropagation();
                                            onDeleteCard(list.id, item.id);
                                        }}>✕
                                        </button>
                                    </div>
                                )}
                            </Draggable>
                        ))}
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>

            {adding ? (
                <div>
                    <input value={cardTitle} onChange={(e) => setCardTitle(e.target.value)}/>
                    <button onClick={() => {
                        onAddCard(list.id, cardTitle);
                        setCardTitle("");
                        setAdding(false);
                    }}>Add
                    </button>
                </div>
            ) : (
                <button onClick={() => setAdding(true)}>+ Add card</button>
            )}
        </div>
    );
};

const CardModal = ({card, onClose, onSave}: any) => {
    const [title, setTitle] = useState(card.title);
    const [description, setDescription] = useState(card.description || "");
    const [status, setStatus] = useState(card.status || "todo");

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <input value={title} onChange={(e) => setTitle(e.target.value)}/>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)}/>
                <select value={status} onChange={(e) => setStatus(e.target.value)}>
                    <option value="todo">To do</option>
                    <option value="in_progress">In progress</option>
                    <option value="done">Done</option>
                </select>
                <button onClick={() => onSave({...card, title, description, status})}>Save</button>
                <button onClick={onClose}>Close</button>
            </div>
        </div>
    );
};

export default Board;