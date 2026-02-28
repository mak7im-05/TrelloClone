import React from "react";
import type {Board, User} from "../static/ts/mockData.ts";

export interface GlobalContextType {
    authUser: User | null;
    checkedAuth: boolean;
    board: Board | null;
    setBoard: React.Dispatch<React.SetStateAction<Board | null>> | null;
}

const globalContext = React.createContext<GlobalContextType>({
    authUser: null,
    checkedAuth: false,
    board: null,
    setBoard: null,
});

export default globalContext;
