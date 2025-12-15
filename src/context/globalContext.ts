import React from "react";
import type {Board} from "../static/ts/util.ts";

export interface GlobalContextType {
    authUser: any | null;
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
