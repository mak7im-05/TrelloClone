import React, {useRef, useState} from "react";
import Labels from "../boards/Labels";
import {timeSince} from "../../static/ts/util";
import ProfilePic from "../boards/ProfilePic";
import type {Item, List, User} from "../../static/ts/mockData";
import {mockUsers} from "../../static/ts/mockData";
import {mockApi} from "../../static/ts/mockApi.ts";

export interface Attachment {
    id: number;
    title: string;
    created_at: string;
}

export interface Comment {
    id: number;
    body: string;
    author: User;
    created_at: string;
}

export interface CardFull extends Item {
    labels: {id: number; color: string}[];
    attachments: Attachment[];
    assigned_to: User[];
    comments?: Comment[];
}

export interface EditCardModalProps {
    card: CardFull;
    list: List;
    onClose: () => void;
    onSave: (updated: CardFull) => void;
}

const STATUS_OPTIONS = [
    {value: "todo", label: "To Do"},
    {value: "in_progress", label: "In Progress"},
    {value: "done", label: "Done"},
];

const EditCardModal: React.FC<EditCardModalProps> = ({card, list, onClose, onSave}) => {
    const [cardState, setCardState] = useState<CardFull>(card);
    const [editingTitle, setEditingTitle] = useState(false);
    const [editingDescription, setEditingDescription] = useState(false);
    const [comments, setComments] = useState<Comment[]>(
        card.comments ?? [
            {id: 1, body: "Looks good to me!", author: mockUsers[0], created_at: new Date().toISOString()},
            {id: 2, body: "Can we push the deadline?", author: mockUsers[1], created_at: new Date().toISOString()},
        ]
    );
    const commentRef = useRef<HTMLTextAreaElement>(null);

    const updateTitle = async (newTitle: string) => {
        if (!newTitle.trim()) return;
        const updated = await mockApi.updateItem(cardState.id, {...cardState, title: newTitle});
        setCardState(updated as CardFull);
    };

    const updateDescription = async (newDesc: string) => {
        const updated = await mockApi.updateItem(cardState.id, {...cardState, description: newDesc});
        setCardState(updated as CardFull);
    };

    const addComment = async (e: React.FormEvent) => {
        e.preventDefault();
        const body = commentRef.current?.value.trim();
        if (!body) return;
        const newComment: Comment = {
            id: Date.now(),
            body,
            author: mockUsers[0],
            created_at: new Date().toISOString(),
        };
        setComments((prev) => [newComment, ...prev]);
        if (commentRef.current) commentRef.current.value = "";
    };

    const removeComment = async (id: number) => {
        await mockApi.deleteComment(id);
        setComments((prev) => prev.filter((c) => c.id !== id));
    };

    const handleSave = () => {
        onSave(cardState);
    };

    const statusColor: Record<string, string> = {
        todo: "bg-gray-100 text-gray-700",
        in_progress: "bg-yellow-100 text-yellow-700",
        done: "bg-green-100 text-green-700",
    };

    return (
        <div
            className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-10 px-4 overflow-y-auto"
            onClick={onClose}
        >
            <div
                className="bg-gray-50 rounded-xl shadow-2xl w-full max-w-2xl mb-10"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="relative px-6 pt-6 pb-4 border-b border-gray-200">
                    {/* Labels */}
                    <Labels labels={cardState.labels}/>

                    {/* Title */}
                    {editingTitle ? (
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                updateTitle(cardState.title);
                                setEditingTitle(false);
                            }}
                            onBlur={() => {
                                updateTitle(cardState.title);
                                setEditingTitle(false);
                            }}
                        >
                            <input
                                type="text"
                                autoFocus
                                value={cardState.title}
                                onChange={(e) => setCardState({...cardState, title: e.target.value})}
                                className="w-full text-xl font-bold text-gray-800 bg-white border border-blue-400 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-200"
                            />
                        </form>
                    ) : (
                        <h2
                            className="text-xl font-bold text-gray-800 cursor-pointer hover:bg-gray-200 rounded-lg px-2 py-1 -mx-2 transition-colors"
                            onClick={() => setEditingTitle(true)}
                        >
                            {cardState.title}
                        </h2>
                    )}

                    <p className="text-xs text-gray-500 mt-1 px-2 -mx-2">
                        in list{" "}
                        <span className="font-medium text-gray-700 underline decoration-dotted">{list.title}</span>
                    </p>

                    {/* Close + Save */}
                    <div className="absolute top-4 right-4 flex items-center gap-2">
                        <button
                            onClick={handleSave}
                            className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg font-medium transition-colors"
                        >
                            Save
                        </button>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 text-xl w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            ×
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div className="px-6 py-4 grid md:grid-cols-3 gap-6">
                    {/* Left column */}
                    <div className="md:col-span-2 space-y-5">
                        {/* Status */}
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Status</p>
                            <div className="flex gap-2">
                                {STATUS_OPTIONS.map((opt) => (
                                    <button
                                        key={opt.value}
                                        onClick={() => setCardState({...cardState, status: opt.value})}
                                        className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors border ${
                                            cardState.status === opt.value
                                                ? statusColor[opt.value] + " border-transparent"
                                                : "border-gray-200 text-gray-500 hover:bg-gray-100"
                                        }`}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</p>
                                {cardState.description && !editingDescription && (
                                    <button
                                        onClick={() => setEditingDescription(true)}
                                        className="text-xs text-blue-600 hover:underline"
                                    >
                                        Edit
                                    </button>
                                )}
                            </div>

                            {editingDescription ? (
                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        updateDescription(cardState.description);
                                        setEditingDescription(false);
                                    }}
                                >
                                    <textarea
                                        autoFocus
                                        value={cardState.description}
                                        onChange={(e) => setCardState({...cardState, description: e.target.value})}
                                        className="w-full border border-blue-400 rounded-lg px-3 py-2 text-sm resize-none outline-none focus:ring-2 focus:ring-blue-200 min-h-[100px]"
                                        rows={4}
                                        onBlur={() => {
                                            updateDescription(cardState.description);
                                            setEditingDescription(false);
                                        }}
                                    />
                                    <div className="flex gap-2 mt-2">
                                        <button
                                            type="submit"
                                            className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg font-medium transition-colors"
                                        >
                                            Save
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setEditingDescription(false)}
                                            className="text-xs text-gray-500 hover:text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            ) : cardState.description ? (
                                <p
                                    className="text-sm text-gray-700 bg-white rounded-lg p-3 border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors whitespace-pre-wrap"
                                    onClick={() => setEditingDescription(true)}
                                >
                                    {cardState.description}
                                </p>
                            ) : (
                                <button
                                    onClick={() => setEditingDescription(true)}
                                    className="w-full text-left text-sm text-gray-400 bg-white rounded-lg p-3 border border-dashed border-gray-300 hover:border-blue-400 hover:text-gray-600 transition-colors"
                                >
                                    + Add a description...
                                </button>
                            )}
                        </div>

                        {/* Attachments */}
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Attachments</p>
                            {cardState.attachments.length === 0 ? (
                                <p className="text-sm text-gray-400 italic">No attachments yet.</p>
                            ) : (
                                <ul className="space-y-1">
                                    {cardState.attachments.map((att) => (
                                        <li key={att.id} className="flex items-center gap-2 text-sm text-gray-700">
                                            <i className="fal fa-paperclip text-gray-400"/>
                                            {att.title}
                                            <span className="text-xs text-gray-400">{timeSince(att.created_at)}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        {/* Comments */}
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Comments</p>

                            <form onSubmit={addComment} className="flex gap-2 mb-4">
                                <ProfilePic user={mockUsers[0]} large/>
                                <div className="flex-1">
                                    <textarea
                                        ref={commentRef}
                                        placeholder="Write a comment..."
                                        rows={2}
                                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                                    />
                                    <button
                                        type="submit"
                                        className="mt-1 text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg font-medium transition-colors"
                                    >
                                        Comment
                                    </button>
                                </div>
                            </form>

                            <ul className="space-y-3">
                                {comments.map((c) => (
                                    <li key={c.id} className="flex gap-3">
                                        <ProfilePic user={c.author}/>
                                        <div className="flex-1">
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-sm font-semibold text-gray-800">{c.author.full_name}</span>
                                                <span className="text-xs text-gray-400">{timeSince(c.created_at)} ago</span>
                                            </div>
                                            <p className="text-sm text-gray-700 bg-white rounded-lg px-3 py-2 border border-gray-200 mt-1">
                                                {c.body}
                                            </p>
                                            <button
                                                onClick={() => removeComment(c.id)}
                                                className="text-xs text-gray-400 hover:text-red-500 mt-1 transition-colors"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Right sidebar */}
                    <div className="space-y-4">
                        {/* Members */}
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Members</p>
                            {cardState.assigned_to.length === 0 ? (
                                <p className="text-xs text-gray-400">No members assigned</p>
                            ) : (
                                <div className="flex flex-wrap gap-1.5">
                                    {cardState.assigned_to.map((user) => (
                                        <div key={user.id} className="flex items-center gap-1.5 bg-white rounded-full px-2 py-1 border border-gray-200">
                                            <ProfilePic user={user}/>
                                            <span className="text-xs text-gray-700">{user.full_name.split(" ")[0]}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Labels */}
                        {cardState.labels.length > 0 && (
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Labels</p>
                                <Labels labels={cardState.labels}/>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditCardModal;
