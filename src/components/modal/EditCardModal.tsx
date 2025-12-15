import React, {useState} from "react";
import {v4 as uuidv4} from "uuid";

import Labels from "../boards/Labels";
import {timeSince} from "../../static/ts/util";
import ProfilePic from "../boards/ProfilePic";
import type {List, User} from "../../static/ts/mockData";
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

export interface Card {
    id: number;
    title: string;
    description: string;
    labels: { id: number; color: string }[];
    attachments: Attachment[];
    assigned_to: User[];
}

export interface EditCardModalProps {
    card: Card;
    list: List;
    setShowModal: (show: boolean) => void;
}

export const EditCardModalMock: React.FC<EditCardModalProps> = ({card, list, setShowModal}) => {
    const [editingTitle, setEditingTitle] = useState(false);
    const [editingDescription, setEditingDescription] = useState(false);
    const [comments, setComments] = useState<Comment[]>([
        {id: 1, body: "This is a comment", author: mockUsers[0], created_at: new Date().toISOString()},
        {id: 2, body: "Another comment", author: mockUsers[1], created_at: new Date().toISOString()},
    ]);
    const [cardState, setCardState] = useState<Card>(card);

    const addComment = (comment: Comment) => setComments((prev) => [...prev, comment]);
    const removeComment = (id: number) => setComments((prev) => prev.filter((c) => c.id !== id));

    const updateTitle = async (newTitle: string) => {
        const updated = await mockApi.updateItem(card.id, {...cardState, title: newTitle});
        setCardState(updated);
    };

    const updateDescription = async (newDesc: string) => {
        const updated = await mockApi.updateItem(card.id, {...cardState, description: newDesc});
        setCardState(updated);
    };

    return (
        <div className="edit-modal">
            <button className="edit-modal__exit" onClick={() => setShowModal(false)}>
                ×
            </button>
            <div className="edit-modal__cols">
                <div className="edit-modal__left">
                    <Labels labels={cardState.labels}/>

                    {!editingTitle ? (
                        <p className="edit-modal__title" onClick={() => setEditingTitle(true)}>
                            {cardState.title}
                        </p>
                    ) : (
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                updateTitle(cardState.title);
                                setEditingTitle(false);
                            }}
                        >
                            <input
                                type="text"
                                value={cardState.title}
                                onChange={(e) => setCardState({...cardState, title: e.target.value})}
                                className="edit-modal__title-edit"
                            />
                        </form>
                    )}

                    <div className="edit-modal__subtitle">in list <span>{list.title}</span></div>

                    <div className="edit-modal__section-header">
                        <div>Description</div>
                        {cardState.description && (
                            <button onClick={() => setEditingDescription(true)} className="btn btn--small">
                                Edit
                            </button>
                        )}
                    </div>

                    {!editingDescription && cardState.description && (
                        <p className="edit-modal__description">{cardState.description}</p>
                    )}

                    {editingDescription ? (
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                updateDescription(cardState.description);
                                setEditingDescription(false);
                            }}
                        >
                            <textarea
                                value={cardState.description}
                                onChange={(e) => setCardState({...cardState, description: e.target.value})}
                            />
                            <button type="submit" className="btn btn--small">Save</button>
                        </form>
                    ) : (
                        !cardState.description && (
                            <button onClick={() => setEditingDescription(true)} className="btn btn--small">
                                Add description
                            </button>
                        )
                    )}

                    <div className="edit-modal__section-header">Attachments</div>
                    {cardState.attachments.length === 0 && <p>No attachments</p>}

                    <div className="edit-modal__section-header">Comments</div>
                    <ul className="edit-modal__comments">
                        {comments.map((c) => (
                            <li key={uuidv4()}>
                                <ProfilePic user={c.author}/>
                                <div>
                                    <p>{c.author.full_name}</p>
                                    <p>{c.body}</p>
                                    <small>{timeSince(c.created_at)}</small>
                                    <button onClick={() => removeComment(c.id)}>Delete</button>
                                </div>
                            </li>
                        ))}
                    </ul>

                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            const newComment: Comment = {
                                id: Date.now(),
                                body: (e.target as any).elements.comment.value,
                                author: mockUsers[0],
                                created_at: new Date().toISOString(),
                            };
                            addComment(newComment);
                            (e.target as any).reset();
                        }}
                    >
                        <textarea name="comment" placeholder="Leave a comment..."/>
                        <button type="submit" className="btn btn--small">Comment</button>
                    </form>
                </div>
            </div>
        </div>
    );
};