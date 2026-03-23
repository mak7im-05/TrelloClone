const API_BASE = import.meta.env.VITE_API_URL || '';
const TOKEN_KEY = 'access_token';
const REFRESH_KEY = 'refresh_token';

export function getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
    localStorage.setItem(TOKEN_KEY, token);
}

export function getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_KEY);
}

export function setRefreshToken(token: string) {
    localStorage.setItem(REFRESH_KEY, token);
}

export function removeToken() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
}

let refreshPromise: Promise<boolean> | null = null;

export async function tryRefreshToken(): Promise<boolean> {
    if (refreshPromise) return refreshPromise;

    refreshPromise = (async () => {
        const refreshToken = getRefreshToken();
        if (!refreshToken) return false;

        try {
            const res = await fetch(`${API_BASE}/api/auth/refresh`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refresh_token: refreshToken }),
            });

            if (!res.ok) {
                removeToken();
                return false;
            }

            const data: { access_token: string; refresh_token: string } = await res.json();
            setToken(data.access_token);
            setRefreshToken(data.refresh_token);
            return true;
        } catch {
            removeToken();
            return false;
        } finally {
            refreshPromise = null;
        }
    })();

    return refreshPromise;
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };
    const token = getToken();
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    let res = await fetch(`${API_BASE}${url}`, { ...options, headers });

    if (res.status === 401 && getRefreshToken()) {
        const refreshed = await tryRefreshToken();
        if (refreshed) {
            headers['Authorization'] = `Bearer ${getToken()}`;
            res = await fetch(`${API_BASE}${url}`, { ...options, headers });
        }
    }

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
    const data = await request<{ access_token: string; refresh_token: string }>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, name }),
    });
    setToken(data.access_token);
    setRefreshToken(data.refresh_token);
    return fetchMe();
}

export async function apiLogin(email: string, password: string) {
    const data = await request<{ access_token: string; refresh_token: string }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
    });
    setToken(data.access_token);
    setRefreshToken(data.refresh_token);
    return fetchMe();
}

export async function apiLogout() {
    const refreshToken = getRefreshToken();
    if (refreshToken) {
        await fetch(`${API_BASE}/api/auth/logout`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh_token: refreshToken }),
        }).catch(() => {});
    }
    removeToken();
}

export async function fetchMe(): Promise<AuthUser> {
    return request<AuthUser>('/api/auth/me');
}
