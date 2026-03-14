import React from "react";
import type {AuthUser} from "../api/auth";

export interface BoardInfo {
    id: number;
    title: string;
    is_starred: boolean;
    color?: string;
    image_url?: string;
}

export interface GlobalContextType {
    authUser: AuthUser | null;
    checkedAuth: boolean;
    board: BoardInfo | null;
    setBoard: React.Dispatch<React.SetStateAction<BoardInfo | null>> | null;
    logout: () => void;
}

const globalContext = React.createContext<GlobalContextType>({
    authUser: null,
    checkedAuth: false,
    board: null,
    setBoard: null,
    logout: () => {},
});

export default globalContext;
