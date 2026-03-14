import React, {useEffect, useRef, useState} from "react";
import {timeSince} from "../../static/ts/util";
import type {CardResponse, CommentResponse, AttachmentResponse} from "../../api/boards";
import {
    fetchComments, createComment, deleteComment,
    fetchAttachments, uploadAttachment, deleteAttachment,
} from "../../api/boards";

const API_BASE = import.meta.env.VITE_API_URL || '';

export interface EditCardModalProps {
    card: CardResponse;
    listName: string;
    onClose: () => void;
    onSave: (updated: CardResponse) => void;
}

const STATUS_OPTIONS = [
    {value: "todo", label: "To Do"},
    {value: "in_progress", label: "In Progress"},
    {value: "done", label: "Done"},
];

const EditCardModal: React.FC<EditCardModalProps> = ({card, listName, onClose, onSave}) => {
    const [cardState, setCardState] = useState<CardResponse>(card);
    const [editingTitle, setEditingTitle] = useState(false);
    const [editingDescription, setEditingDescription] = useState(false);
    const [comments, setComments] = useState<CommentResponse[]>([]);
    const [attachments, setAttachments] = useState<AttachmentResponse[]>([]);
    const [uploading, setUploading] = useState(false);
    const commentRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchComments(card.id).then(setComments).catch(() => {});
        fetchAttachments(card.id).then(setAttachments).catch(() => {});
    }, [card.id]);

    const handleSave = () => {
        onSave(cardState);
    };

    const addComment = async (e: React.FormEvent) => {
        e.preventDefault();
        const body = commentRef.current?.value.trim();
        if (!body) return;
        const newComment = await createComment(card.id, body);
        setComments((prev) => [newComment, ...prev]);
        if (commentRef.current) commentRef.current.value = "";
    };

    const removeComment = async (id: number) => {
        await deleteComment(id);
        setComments((prev) => prev.filter((c) => c.id !== id));
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        try {
            const att = await uploadAttachment(card.id, file);
            setAttachments((prev) => [att, ...prev]);
        } catch (err) {
            console.error("Upload failed:", err);
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleDeleteAttachment = async (id: number) => {
        await deleteAttachment(id);
        setAttachments((prev) => prev.filter((a) => a.id !== id));
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
                    {editingTitle ? (
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                setEditingTitle(false);
                            }}
                            onBlur={() => setEditingTitle(false)}
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
                        <span className="font-medium text-gray-700 underline decoration-dotted">{listName}</span>
                    </p>

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
                <div className="px-6 py-4 space-y-5">
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
                                    setEditingDescription(false);
                                }}
                            >
                                <textarea
                                    autoFocus
                                    value={cardState.description ?? ""}
                                    onChange={(e) => setCardState({...cardState, description: e.target.value})}
                                    className="w-full border border-blue-400 rounded-lg px-3 py-2 text-sm resize-none outline-none focus:ring-2 focus:ring-blue-200 min-h-[100px]"
                                    rows={4}
                                    onBlur={() => setEditingDescription(false)}
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
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Attachments</p>
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploading}
                                className="text-xs text-blue-600 hover:underline disabled:text-gray-400"
                            >
                                {uploading ? "Uploading..." : "+ Add file"}
                            </button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                className="hidden"
                                onChange={handleFileUpload}
                            />
                        </div>

                        {attachments.length === 0 ? (
                            <p className="text-sm text-gray-400 italic">No attachments yet.</p>
                        ) : (
                            <ul className="space-y-2">
                                {attachments.map((att) => (
                                    <li key={att.id} className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-gray-200">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <i className="fal fa-paperclip text-gray-400 flex-shrink-0"/>
                                            <a
                                                href={`${API_BASE}${att.url}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-sm text-blue-600 hover:underline truncate"
                                            >
                                                {att.filename}
                                            </a>
                                            <span className="text-xs text-gray-400 flex-shrink-0">{timeSince(att.createdAt)}</span>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteAttachment(att.id)}
                                            className="text-gray-400 hover:text-red-500 text-sm ml-2 flex-shrink-0"
                                        >
                                            <i className="fal fa-trash"/>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* Comments */}
                    <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Comments</p>

                        <form onSubmit={addComment} className="mb-4">
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
                        </form>

                        <ul className="space-y-3">
                            {comments.map((c) => (
                                <li key={c.id} className="flex gap-3">
                                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                        {(c.author?.name || c.author?.email || "?")[0].toUpperCase()}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-sm font-semibold text-gray-800">
                                                {c.author?.name || c.author?.email || "User"}
                                            </span>
                                            <span className="text-xs text-gray-400">{timeSince(c.createdAt)} ago</span>
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
            </div>
        </div>
    );
};

export default EditCardModal;
