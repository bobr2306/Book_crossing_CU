import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [token, setToken] = useState(() => localStorage.getItem('token'));
    const [userId, setUserId] = useState(() => localStorage.getItem('userId'));
    const [role, setRole] = useState(() => localStorage.getItem('role'));
    const [username, setUsername] = useState(() => localStorage.getItem('username'));
    
    const isLoggedIn = !!token;
    const isAdmin = role === 'admin';

    const login = (token, userId, role, username) => {
        setToken(token);
        setUserId(userId);
        setRole(role);
        setUsername(username);

        localStorage.setItem('token', token);
        localStorage.setItem('userId', userId);
        localStorage.setItem('role', role);
        localStorage.setItem('username', username);
    };

    const logout = () => {
        setToken(null);
        setUserId(null);
        setRole(null);
        setUsername(null);

        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('role');
        localStorage.removeItem('username');
    };

    const register = async (username, password) => {
        const response = await fetch('http://localhost:5001/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'Ошибка регистрации');
        }
        // Можно сразу логинить пользователя, если нужно
    };

    useEffect(() => {
        // Если username не установлен, пробуем взять из localStorage
        if (!username && localStorage.getItem('username')) {
            setUsername(localStorage.getItem('username'));
        }
    }, []);

    return (
        <AuthContext.Provider
            value={{
                token,
                userId,
                role,
                username,
                isLoggedIn,
                isAdmin,
                login,
                logout,
                register,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}