import { useLocation, Routes, Route } from "react-router-dom";
import Header from "./components/header/Header";
import Home from "./components/pages/Home.tsx";
import BoardPage from "./components/pages/BoardPage";
import AuthPage from "./components/pages/AuthPage.tsx";

function App() {
    const location = useLocation();

    const showHeader = location.pathname !== "/register";

    return (
        <div>
            {showHeader && <Header location={location} />}
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/b/:boardId" element={<BoardPage />} />
                <Route path="/register" element={<AuthPage />} />
            </Routes>
        </div>
    );
}

export default App;
