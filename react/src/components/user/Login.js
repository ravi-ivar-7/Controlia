// components/Login.js
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

const Login = () => {
    const [credentials, setCredentials] = useState({ userId: '', password: '' });
    const { login, loading, error } = useAuth();
    const [show, setShow] = useState(false);

    const toggleShow = () => {
        setShow(!show);
    };

    // Handle input changes
    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        await login(credentials);
    };

    const styles = {
        section: {
            backgroundColor: '#1a1a1a',
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        },
        container: {
            width: '100%',
            maxWidth: '400px',
            backgroundColor: '#333',
            border: '1px solid #444',
            borderRadius: '8px',
            padding: '20px',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.5)',
        },
        input: {
            width: '100%',
            padding: '10px',
            margin: '8px 0',
            border: 'none',
            borderRadius: '4px',
            backgroundColor: '#444',
            color: 'white',
        },
        button: {
            width: '100%',
            padding: '10px',
            margin: '8px 0',
            border: 'none',
            borderRadius: '4px',
            backgroundColor: '#0066ff',
            color: 'white',
            cursor: 'pointer',
            transition: 'background-color 0.3s',
        },
        buttonHover: {
            backgroundColor: '#0052cc',
        },
        error: {
            color: 'red',
        },
        link: {
            color: 'white',
            textDecoration: 'underline',
        },
    };

    return (
        <section style={styles.section}>
            <div style={styles.container}>
                <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
                    <h1 className="text-xl font-bold leading-tight tracking-tight md:text-2xl text-white">
                        Log in to your account
                    </h1>
                    <form className="space-y-4 md:space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="userId" className="block mb-2 text-sm font-medium text-white">
                                Your Email/Username
                            </label>
                            <input
                                type="text"
                                name="userId"
                                id="userId"
                                placeholder="User ID or Email"
                                value={credentials.userId}
                                onChange={handleChange}
                                required
                                style={styles.input}
                            />

                            <label htmlFor="password" className="block mb-2 text-sm font-medium text-white">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type={show ? "text" : "password"}
                                    name="password"
                                    id="password"
                                    placeholder="••••••••"
                                    value={credentials.password}
                                    onChange={handleChange}
                                    required
                                    style={styles.input}
                                />
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5">
                                    <svg
                                        className={`h-6 text-gray-700 ${show ? "hidden" : "block"}`}
                                        fill="none"
                                        onClick={toggleShow}
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 576 512"
                                    >
                                        <path
                                            fill="currentColor"
                                            d="M572.52 241.4C518.29 135.59 410.93 64 288 64S57.68 135.64 3.48 241.41a32.35 32.35 0 0 0 0 29.19C57.71 376.41 165.07 448 288 448s230.32-71.64 284.52-177.41a32.35 32.35 0 0 0 0-29.19zM288 400a144 144 0 1 1 144-144 143.93 143.93 0 0 1-144 144zm0-240a95.31 95.31 0 0 0-25.31 3.79 47.85 47.85 0 0 1-66.9 66.9A95.78 95.78 0 1 0 288 160z"
                                        />
                                    </svg>
                                    <svg
                                        className={`h-6 text-gray-700 ${show ? "block" : "hidden"}`}
                                        fill="none"
                                        onClick={toggleShow}
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 640 512"
                                    >
                                        <path
                                            fill="currentColor"
                                            d="M320 400c-75.85 0-137.25-58.71-142.9-133.11L72.2 185.82c-13.79 17.3-26.48 35.59-36.72 55.59a32.35 32.35 0 0 0 0 29.19C89.71 376.41 197.07 448 320 448c26.91 0 52.87-4 77.89-10.46L346 397.39a144.13 144.13 0 0 1-26 2.61zm313.82 58.1l-110.55-85.44a331.25 331.25 0 0 0 81.25-102.07 32.35 32.35 0 0 0 0-29.19C550.29 135.59 442.93 64 320 64a308.15 308.15 0 0 0-147.32 37.7L45.46 3.37A16 16 0 0 0 23 6.18L3.37 31.45A16 16 0 0 0 6.18 53.9l588.36 454.73a16 16 0 0 0 22.46-2.81l19.64-25.27a16 16 0 0 0-2.82-22.45zm-183.72-142l-39.3-30.38A94.75 94.75 0 0 0 416 256a94.76 94.76 0 0 0-121.31-92.21A47.65 47.65 0 0 1 304 192a46.64 46.64 0 0 1-1.54 10l-73.61-56.89A142.31 142.31 0 0 1 320 112a143.92 143.92 0 0 1 144 144c0 21.63-5.29 41.79-13.9 60.11z"
                                        />
                                    </svg>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <Link to="/forgot-password" style={styles.link}>
                                Forgot password?
                            </Link>
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            style={styles.button}
                            className={loading ? 'hover:bg-primary-800' : 'hover:bg-primary-700'}
                        >
                            {loading ? 'Logging in...' : 'Login'}
                        </button>
                        {error && <p style={styles.error}>{error}</p>}
                        <p className="text-sm text-white">
                            Don't have an account yet?
                            <Link to="/register" style={styles.link}>
                                Sign up
                            </Link>
                        </p>
                    </form>
                </div>
            </div>
        </section>
    );
};

export default Login;
