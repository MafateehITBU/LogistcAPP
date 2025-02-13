import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../axiosConfig";
import Cookies from "js-cookie";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate(); // To handle redirection

    const handleLogin = async (e) => {
        e.preventDefault(); // Prevent page reload

        try {
            const response = await axiosInstance.post("/admin/login", {
                email,
                password,
            });

            // Save the JWT in a cookie
            Cookies.set("jwt", response.data.accessToken, {
                expires: 1, // Expires in 1 day
            });

            // Save the role in a cookie
            Cookies.set("adminRole", response.data.role, {
                expires: 1, // Expires in 1 day
            });

            // Redirect to home page
            navigate("/");
        } catch (err) {
            console.error("Login failed:", err.response?.data?.message || err.message);
            setError(err.response?.data?.message || "Something went wrong. Please try again.");
        }
    };

    return (
        <div className="login-container">
            <div className="container">
                <div className="row">
                    <div className="col-lg-3 col-md-2"></div>
                    <div className="col-lg-6 col-md-8 login-box">
                        <div className="col-lg-12 login-key">
                            <i className="fa fa-key" aria-hidden="true"></i>
                        </div>
                        <div className="col-lg-12 login-title">ADMIN PANEL</div>

                        <div className="col-lg-12 login-form">
                            <form onSubmit={handleLogin}>
                                {error && <div className="alert alert-danger">{error}</div>}
                                <div className="form-floating form-floating-custom mb-3">
                                    <input
                                        type="email"
                                        className="form-control"
                                        id="email"
                                        placeholder="name@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                    <label htmlFor="email">Email</label>
                                </div>
                                <div className="form-floating form-floating-custom mb-3">
                                    <input
                                        type="password"
                                        className="form-control"
                                        id="password"
                                        placeholder="Password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                    <label htmlFor="password">Password</label>
                                </div>

                                <div className="loginbttm">
                                    <button type="submit" className="btn btn-outline-primary">
                                        LOGIN
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                    <div className="col-lg-3 col-md-2"></div>
                </div>
            </div>
        </div>
    );
};

export default Login;