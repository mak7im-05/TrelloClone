import React from "react";
import type {Board} from "../static/ts/mockData.ts";
import type {AuthUser} from "../api/auth.ts";

export interface GlobalContextType {
    authUser: AuthUser | null;
    checkedAuth: boolean;
    board: Board | null;
    setBoard: React.Dispatch<React.SetStateAction<Board | null>> | null;
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
