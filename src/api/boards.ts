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
    labels?: { label: { id: number; name: string; color: string } }[];
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

// ─── Attachment API ──────────────────────────────────────────────────────────

export interface AttachmentResponse {
    id: number;
    filename: string;
    url: string;
    createdAt: string;
    cardId: number;
}

export function fetchAttachments(cardId: number): Promise<AttachmentResponse[]> {
    return request(`/api/cards/${cardId}/attachments`);
}

export async function uploadAttachment(cardId: number, file: File): Promise<AttachmentResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const token = getToken();
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}/api/cards/${cardId}/attachments`, {
        method: 'POST',
        headers,
        body: formData,
    });
    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || res.statusText);
    }
    return res.json();
}

export function deleteAttachment(id: number): Promise<void> {
    return request(`/api/attachments/${id}`, { method: 'DELETE' });
}

// ─── Label API ──────────────────────────────────────────────────────────

export interface LabelResponse {
    id: number;
    name: string;
    color: string;
    boardId: number;
}

export interface CardLabelResponse {
    cardId: number;
    labelId: number;
    label: LabelResponse;
}

export function fetchLabels(boardId: number): Promise<LabelResponse[]> {
    return request(`/api/boards/${boardId}/labels`);
}

export function createLabel(boardId: number, data: { name: string; color: string }): Promise<LabelResponse> {
    return request(`/api/boards/${boardId}/labels`, {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

export function updateLabel(id: number, data: { name?: string; color?: string }): Promise<LabelResponse> {
    return request(`/api/labels/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
    });
}

export function deleteLabel(id: number): Promise<void> {
    return request(`/api/labels/${id}`, { method: 'DELETE' });
}

export function addLabelToCard(cardId: number, labelId: number): Promise<CardLabelResponse> {
    return request(`/api/cards/${cardId}/labels/${labelId}`, { method: 'POST' });
}

export function removeLabelFromCard(cardId: number, labelId: number): Promise<void> {
    return request(`/api/cards/${cardId}/labels/${labelId}`, { method: 'DELETE' });
}

// ─── Search API ──────────────────────────────────────────────────────────────

export function searchBoards(q: string): Promise<BoardSummary[]> {
    return request(`/api/search/boards?q=${encodeURIComponent(q)}`);
}

// ─── Members API ─────────────────────────────────────────────────────────────

export interface MemberResponse {
    id: number;
    role: string;
    userId: number;
    boardId: number;
    user: { id: number; email: string; name: string | null };
}

export function fetchMembers(boardId: number): Promise<MemberResponse[]> {
    return request(`/api/boards/${boardId}/members`);
}

export function addMember(boardId: number, email: string, role = 'member'): Promise<MemberResponse> {
    return request(`/api/boards/${boardId}/members`, {
        method: 'POST',
        body: JSON.stringify({ email, role }),
    });
}

export function updateMemberRole(boardId: number, userId: number, role: string): Promise<MemberResponse> {
    return request(`/api/boards/${boardId}/members/${userId}`, {
        method: 'PATCH',
        body: JSON.stringify({ role }),
    });
}

export function removeMember(boardId: number, userId: number): Promise<void> {
    return request(`/api/boards/${boardId}/members/${userId}`, { method: 'DELETE' });
}

// ─── Card Assignees API ──────────────────────────────────────────────────────

export interface AssigneeResponse {
    cardId: number;
    userId: number;
    user: { id: number; email: string; name: string | null };
}

export function fetchAssignees(cardId: number): Promise<AssigneeResponse[]> {
    return request(`/api/cards/${cardId}/assignees`);
}

export function assignCard(cardId: number, userId: number): Promise<AssigneeResponse> {
    return request(`/api/cards/${cardId}/assignees`, {
        method: 'POST',
        body: JSON.stringify({ userId }),
    });
}

export function unassignCard(cardId: number, userId: number): Promise<void> {
    return request(`/api/cards/${cardId}/assignees/${userId}`, { method: 'DELETE' });
}
