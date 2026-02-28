import { useState } from "react";
import { useLocation, Routes, Route } from "react-router-dom";
import Header from "./components/header/Header";
import Home from "./components/pages/Home.tsx";
import BoardPage from "./components/pages/BoardPage";
import AuthPage from "./components/pages/AuthPage.tsx";
import globalContext from "./context/globalContext";
import type { Board } from "./static/ts/mockData";
import { mockUsers } from "./static/ts/mockData";

function App() {
    const location = useLocation();
    const [board, setBoard] = useState<Board | null>(null);

    const showHeader = location.pathname !== "/register";

    return (
        <globalContext.Provider
            value={{
                authUser: mockUsers[0],
                checkedAuth: true,
                board,
                setBoard,
            }}
        >
            {showHeader && <Header location={location} />}
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/b/:boardId" element={<BoardPage />} />
                <Route path="/register" element={<AuthPage />} />
            </Routes>
        </globalContext.Provider>
    );
}

export default App;
