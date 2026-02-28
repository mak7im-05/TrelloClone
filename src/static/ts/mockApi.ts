const delay = (ms = 200) => new Promise((r) => setTimeout(r, ms));

export const mockApi = {
    updateItem: async (itemId: string | number, payload: any) => {
        await delay();
        return {...payload, id: itemId};
    },

    deleteItem: async (itemId: string | number) => {
        await delay();
        return {id: itemId};
    },

    addComment: async (cardId: string | number, body: string, authorId: number) => {
        await delay();
        return {
            id: Date.now(),
            body,
            card: cardId,
            author: {id: authorId, full_name: "You"},
            created_at: new Date().toISOString(),
        };
    },

    deleteComment: async (commentId: number) => {
        await delay();
        return {id: commentId};
    },
};
