import {useEffect, useState} from "react";
import {useLocation, useNavigate, Routes, Route} from "react-router-dom";
import Header from "./components/header/Header";
import Home from "./components/pages/Home";
import BoardPage from "./components/pages/BoardPage";
import AuthPage from "./components/pages/AuthPage";
import globalContext, {type BoardInfo} from "./context/globalContext";
import {fetchMe, getToken, removeToken, type AuthUser} from "./api/auth";

function App() {
    const location = useLocation();
    const navigate = useNavigate();
    const [board, setBoard] = useState<BoardInfo | null>(null);
    const [authUser, setAuthUser] = useState<AuthUser | null>(null);
    const [checkedAuth, setCheckedAuth] = useState(false);

    useEffect(() => {
        const token = getToken();
        if (!token) {
            setCheckedAuth(true);
            return;
        }
        fetchMe()
            .then((user) => setAuthUser(user))
            .catch(() => removeToken())
            .finally(() => setCheckedAuth(true));
    }, []);

    useEffect(() => {
        if (!checkedAuth) return;
        if (!authUser && location.pathname !== "/register") {
            navigate("/register", {replace: true});
        }
    }, [checkedAuth, authUser, location.pathname, navigate]);

    const logout = () => {
        removeToken();
        setAuthUser(null);
        navigate("/register", {replace: true});
    };

    const handleAuth = (user: AuthUser) => {
        setAuthUser(user);
        navigate("/", {replace: true});
    };

    const showHeader = location.pathname !== "/register" && authUser;

    if (!checkedAuth) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-gray-400 text-lg">Loading...</div>
            </div>
        );
    }

    return (
        <globalContext.Provider
            value={{
                authUser,
                checkedAuth,
                board,
                setBoard,
                logout,
            }}
        >
            {showHeader && <Header location={location}/>}
            <Routes>
                <Route path="/" element={<Home/>}/>
                <Route path="/b/:boardId" element={<BoardPage/>}/>
                <Route path="/register" element={<AuthPage onAuth={handleAuth}/>}/>
            </Routes>
        </globalContext.Provider>
    );
}

export default App;
