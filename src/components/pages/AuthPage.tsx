import React, {useState} from "react";
import "../../static/css/auth.css";
import logo from "../../static/img/logo2.png";

type Mode = "login" | "register";

const AuthPage: React.FC = () => {
    const [mode, setMode] = useState<Mode>("login");

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState("");

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (mode === "register") {
            console.log("REGISTER", {
                fullName,
                email,
                password,
            });
        } else {
            console.log("LOGIN", {
                email,
                password,
            });
        }
    };

    return (
        <div className="auth-split">
            {/* LEFT */}
            <div className="auth-split__left">
                <img src={logo} alt="Trello" className="auth-logo" />

                <form className="auth-form" onSubmit={onSubmit}>
                    {mode === "register" && (
                        <input
                            type="text"
                            placeholder="Full name"
                            value={fullName}
                            onChange={(e) =>
                                setFullName(e.target.value)
                            }
                            required
                        />
                    )}

                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) =>
                            setEmail(e.target.value)
                        }
                        required
                    />

                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) =>
                            setPassword(e.target.value)
                        }
                        required
                    />

                    <button type="submit">
                        {mode === "login"
                            ? "Log in"
                            : "Sign up"}
                    </button>
                </form>

                <div className="auth-footer">
                    {mode === "login" ? (
                        <>
                            Don’t have an account?{" "}
                            <button
                                onClick={() =>
                                    setMode("register")
                                }
                            >
                                Sign up
                            </button>
                        </>
                    ) : (
                        <>
                            Already have an account?{" "}
                            <button
                                onClick={() =>
                                    setMode("login")
                                }
                            >
                                Log in
                            </button>
                        </>
                    )}
                </div>
            </div>

            <div className="auth-split__right">
                <div className="auth-bg">
                    <h1>Plan your tasks</h1>
                    <p>
                        Plan out your tasks and vacations using
                        trello
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;
