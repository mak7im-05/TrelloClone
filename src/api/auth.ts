const API_BASE = import.meta.env.VITE_API_URL || '';
const TOKEN_KEY = 'access_token';

export function getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
    localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken() {
    localStorage.removeItem(TOKEN_KEY);
}

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

export interface AuthUser {
    id: number;
    email: string;
    name: string | null;
}

export async function apiRegister(email: string, password: string, name?: string) {
    const data = await request<{ access_token: string }>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, name }),
    });
    setToken(data.access_token);
    return fetchMe();
}

export async function apiLogin(email: string, password: string) {
    const data = await request<{ access_token: string }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
    });
    setToken(data.access_token);
    return fetchMe();
}

export async function fetchMe(): Promise<AuthUser> {
    return request<AuthUser>('/api/auth/me');
}
