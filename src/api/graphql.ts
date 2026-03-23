import { getToken } from './auth';

const API_BASE = import.meta.env.VITE_API_URL || '';

interface GraphQLResponse<T> {
    data?: T;
    errors?: { message: string }[];
}

export async function gqlRequest<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
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
    let json: GraphQLResponse<T>;
    try {
        json = JSON.parse(text);
    } catch {
        console.error('[GraphQL] Response is not JSON:', text.slice(0, 500));
        throw new Error('GraphQL endpoint returned non-JSON response');
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
