import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [userId, setUserId] = useState(localStorage.getItem('user_id') || '');
  const [role, setRole] = useState(localStorage.getItem('role') || '');

  const login = (accessToken, userId, userRole) => {
    setToken(accessToken);
    setUserId(userId);
    setRole(userRole);

    localStorage.setItem('token', accessToken);
    localStorage.setItem('user_id', userId);
    localStorage.setItem('role', userRole);
  };

  const logout = () => {
    setToken('');
    setUserId('');
    setRole('');

    localStorage.removeItem('token');
    localStorage.removeItem('user_id');
    localStorage.removeItem('role');
  };

  const isLoggedIn = !!token;

  return (
      <AuthContext.Provider value={{ token, userId, role, login, logout, isLoggedIn }}>
        {children}
      </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
