import React, {useState} from "react";
import logo from "../../static/img/logo.png";
import slideshowBg from "../../static/img/slideshow-1.jpg";
import {apiLogin, apiRegister, type AuthUser} from "../../api/auth";

type Mode = "login" | "register";

interface AuthPageProps {
    onAuth: (user: AuthUser) => void;
}

const AuthPage: React.FC<AuthPageProps> = ({onAuth}) => {
    const [mode, setMode] = useState<Mode>("login");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            let user: AuthUser;
            if (mode === "register") {
                user = await apiRegister(email, password, fullName || undefined);
            } else {
                user = await apiLogin(email, password);
            }
            onAuth(user);
        } catch (err: any) {
            setError(err.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const inputClass =
        "w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm transition-all";

    return (
        <div className="min-h-screen flex">
            {/* LEFT panel */}
            <div className="flex flex-col justify-center w-full md:w-[420px] px-8 md:px-12 bg-white">
                <img src={logo} alt="Trello" className="w-24 mb-10"/>

                <h1 className="text-2xl font-bold text-gray-800 mb-1">
                    {mode === "login" ? "Log in to Trello" : "Create your account"}
                </h1>
                <p className="text-gray-500 text-sm mb-8">
                    {mode === "login"
                        ? "Enter your credentials to access your boards."
                        : "Start organizing your work today."}
                </p>

                {error && (
                    <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 text-sm">
                        {error}
                    </div>
                )}

                <form className="space-y-4" onSubmit={onSubmit}>
                    {mode === "register" && (
                        <input
                            type="text"
                            placeholder="Full name"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className={inputClass}
                        />
                    )}
                    <input
                        type="email"
                        placeholder="Email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={inputClass}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={inputClass}
                        required
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-[#0052cc] hover:bg-[#0065ff] disabled:opacity-50 text-white font-semibold rounded-lg transition-colors text-sm"
                    >
                        {loading ? "Please wait..." : mode === "login" ? "Log in" : "Sign up"}
                    </button>
                </form>

                <p className="mt-6 text-sm text-gray-500 text-center">
                    {mode === "login" ? (
                        <>
                            Don&apos;t have an account?{" "}
                            <button
                                onClick={() => {
                                    setMode("register");
                                    setError("");
                                }}
                                className="text-[#0052cc] hover:underline font-medium bg-transparent border-none cursor-pointer"
                            >
                                Sign up
                            </button>
                        </>
                    ) : (
                        <>
                            Already have an account?{" "}
                            <button
                                onClick={() => {
                                    setMode("login");
                                    setError("");
                                }}
                                className="text-[#0052cc] hover:underline font-medium bg-transparent border-none cursor-pointer"
                            >
                                Log in
                            </button>
                        </>
                    )}
                </p>
            </div>

            {/* RIGHT panel — hidden on mobile */}
            <div
                className="hidden md:flex flex-1 relative items-end"
                style={{
                    backgroundImage: `url(${slideshowBg})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                }}
            >
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"/>
                <div className="relative z-10 p-12 text-white">
                    <h2 className="text-4xl font-bold mb-3">Plan your tasks</h2>
                    <p className="text-lg opacity-90 max-w-sm">
                        Organize projects, track progress and collaborate with your team — all in one place.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;
