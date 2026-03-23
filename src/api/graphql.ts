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

    const json: GraphQLResponse<T> = await res.json();

    if (json.errors?.length) {
        throw new Error(json.errors[0].message);
    }
    if (!json.data) {
        throw new Error('No data returned from GraphQL');
    }
    return json.data;
}
