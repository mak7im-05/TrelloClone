import { getToken } from './auth';

const API_BASE = import.meta.env.VITE_API_URL || '';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };
    const token = getToken();
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    const res = await fetch(`${API_BASE}${url}`, { ...options, headers });
    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || res.statusText);
    }
    return res.json();
}

// ─── Types matching backend responses ────────────────────────────────────────

export interface BoardSummary {
    id: number;
    title: string;
    color: string | null;
    imageUrl: string | null;
    isStarred: boolean;
    members?: { user: { id: number; email: string; name: string | null } }[];
}

export interface CardResponse {
    id: number;
    title: string;
    description: string | null;
    status: string;
    order: number;
    listId: number;
}

export interface ListResponse {
    id: number;
    title: string;
    order: number;
    cards: CardResponse[];
}

export interface BoardFull {
    id: number;
    title: string;
    color: string | null;
    imageUrl: string | null;
    isStarred: boolean;
    lists: ListResponse[];
    labels: { id: number; name: string; color: string }[];
    members: { user: { id: number; email: string; name: string | null } }[];
}

export interface CommentResponse {
    id: number;
    body: string;
    createdAt: string;
    authorId: number;
    author?: { id: number; email: string; name: string | null };
}

// ─── Board API ───────────────────────────────────────────────────────────────

export function fetchBoards(): Promise<BoardSummary[]> {
    return request('/api/boards');
}

export function fetchBoard(id: number): Promise<BoardFull> {
    return request(`/api/boards/${id}`);
}

export function createBoard(data: { title: string; color?: string; imageUrl?: string }): Promise<BoardSummary> {
    return request('/api/boards', {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

export function updateBoard(id: number, data: { title?: string; color?: string; imageUrl?: string; isStarred?: boolean }): Promise<BoardSummary> {
    return request(`/api/boards/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
    });
}

export function deleteBoard(id: number): Promise<void> {
    return request(`/api/boards/${id}`, { method: 'DELETE' });
}

// ─── List API ────────────────────────────────────────────────────────────────

export function createList(boardId: number, data: { title: string }): Promise<ListResponse> {
    return request(`/api/boards/${boardId}/lists`, {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

export function updateList(id: number, data: { title: string }): Promise<ListResponse> {
    return request(`/api/lists/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
    });
}

export function deleteList(id: number): Promise<void> {
    return request(`/api/lists/${id}`, { method: 'DELETE' });
}

export function reorderLists(boardId: number, orderedIds: number[]): Promise<void> {
    return request(`/api/boards/${boardId}/lists/reorder`, {
        method: 'PUT',
        body: JSON.stringify({ orderedIds }),
    });
}

// ─── Card API ────────────────────────────────────────────────────────────────

export function createCard(listId: number, data: { title: string }): Promise<CardResponse> {
    return request(`/api/lists/${listId}/cards`, {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

export function updateCard(id: number, data: { title?: string; description?: string; status?: string }): Promise<CardResponse> {
    return request(`/api/cards/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
    });
}

export function deleteCard(id: number): Promise<void> {
    return request(`/api/cards/${id}`, { method: 'DELETE' });
}

export function moveCard(id: number, targetListId: number, order: number): Promise<void> {
    return request(`/api/cards/${id}/move`, {
        method: 'PUT',
        body: JSON.stringify({ targetListId, order }),
    });
}

export function reorderCards(listId: number, orderedIds: number[]): Promise<void> {
    return request(`/api/cards/reorder`, {
        method: 'PUT',
        body: JSON.stringify({ listId, orderedIds }),
    });
}

// ─── Comment API ─────────────────────────────────────────────────────────────

export function fetchComments(cardId: number): Promise<CommentResponse[]> {
    return request(`/api/cards/${cardId}/comments`);
}

export function createComment(cardId: number, body: string): Promise<CommentResponse> {
    return request(`/api/cards/${cardId}/comments`, {
        method: 'POST',
        body: JSON.stringify({ body }),
    });
}

export function deleteComment(id: number): Promise<void> {
    return request(`/api/comments/${id}`, { method: 'DELETE' });
}
