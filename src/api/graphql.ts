import { getToken, getRefreshToken, tryRefreshToken } from './auth';

const API_BASE = import.meta.env.VITE_API_URL || '';

interface GraphQLResponse<T> {
    data?: T;
    errors?: { message: string; extensions?: { code?: string } }[];
}

async function doGqlFetch<T>(query: string, variables?: Record<string, unknown>): Promise<GraphQLResponse<T>> {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };
    const token = getToken();
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE}/graphql`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ query, variables }),
    });

    const text = await res.text();
    try {
        return JSON.parse(text);
    } catch {
        console.error('[GraphQL] Response is not JSON:', text.slice(0, 500));
        throw new Error('GraphQL endpoint returned non-JSON response');
    }
}

function isAuthError<T>(json: GraphQLResponse<T>): boolean {
    return json.errors?.some(
        (e) => e.extensions?.code === 'UNAUTHENTICATED' || e.message === 'Unauthorized',
    ) ?? false;
}

export async function gqlRequest<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
    let json = await doGqlFetch<T>(query, variables);

    if (isAuthError(json) && getRefreshToken()) {
        const refreshed = await tryRefreshToken();
        if (refreshed) {
            json = await doGqlFetch<T>(query, variables);
        }
    }

    if (json.errors?.length) {
        console.error('[GraphQL] Errors:', json.errors);
        throw new Error(json.errors[0].message);
    }
    if (!json.data) {
        console.error('[GraphQL] No data in response:', json);
        throw new Error('No data returned from GraphQL');
    }
    return json.data;
}
