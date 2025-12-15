export const mockApi = {
    updateItem: async (itemId: number, payload: any) => {
        await new Promise((r) => setTimeout(r, 200));

        return {
            ...payload,
            id: itemId,
        };
    },
};