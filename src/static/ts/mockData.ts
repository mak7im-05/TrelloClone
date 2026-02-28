import type {BackgroundOption} from "./util";

export const mockImages: BackgroundOption[] = [
    ["https://picsum.photos/id/1015/200/120", true, "https://picsum.photos/id/1015/800/480"],
    ["https://picsum.photos/id/1020/200/120", true, "https://picsum.photos/id/1020/800/480"],
    ["https://picsum.photos/id/1035/200/120", true, "https://picsum.photos/id/1035/800/480"],
    ["https://picsum.photos/id/1045/200/120", true, "https://picsum.photos/id/1045/800/480"],
    ["https://picsum.photos/id/1015/200/150", true, "https://picsum.photos/id/1015/800/600"],
    ["https://picsum.photos/id/1016/200/150", true, "https://picsum.photos/id/1016/800/600"],
    ["https://picsum.photos/id/1018/200/150", true, "https://picsum.photos/id/1018/800/600"],
];

export const mockColors: BackgroundOption[] = [
    ["#4680FF", false],
    ["#FFB64D", false],
    ["#FF5E5E", false],
    ["#4CAF50", false],
];

export interface User {
    id: number;
    full_name: string;
    profile_pic?: string;
}

export interface Item {
    id: string;
    title: string;
    description: string;
    status: string;
    order: string;
    list: string;
}

export interface List {
    id: string;
    title: string;
    order: string;
    items: Item[];
}

export interface Board {
    id: number;
    title: string;
    is_starred: boolean;
    color?: string;
    image_url?: string;
    members?: User[];
}

export const mockUsers: User[] = [
    {id: 1, full_name: "Alice Johnson"},
    {id: 2, full_name: "Bob Smith"},
    {id: 3, full_name: "Charlie Brown"},
    {id: 4, full_name: "Diana Prince"},
];

export const mockBoards: Board[] = [
    {
        id: 1,
        title: "Development Board",
        color: "#4680FF",
        is_starred: false,
        members: mockUsers,
    },
    {
        id: 2,
        title: "Marketing Board",
        image_url: "https://picsum.photos/id/1020/800/480",
        is_starred: true,
        members: [mockUsers[0], mockUsers[2]],
    },
    {
        id: 3,
        title: "Design Board",
        image_url: "https://picsum.photos/id/1035/800/480",
        is_starred: false,
    },
];

export interface BoardFull {
    id: number;
    title: string;
    color?: string;
    image_url?: string;
    lists: List[];
}
