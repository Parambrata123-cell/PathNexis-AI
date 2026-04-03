'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '@/lib/api';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const savedToken = localStorage.getItem('pathnexis_token');
    const savedUser = localStorage.getItem('pathnexis_user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('pathnexis_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    const { token: newToken, user: userData } = res.data;
    localStorage.setItem('pathnexis_token', newToken);
    localStorage.setItem('pathnexis_user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
    return userData;
  };

  const register = async (data) => {
    const res = await authAPI.register(data);
    const { token: newToken, user: userData } = res.data;
    localStorage.setItem('pathnexis_token', newToken);
    localStorage.setItem('pathnexis_user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('pathnexis_token');
    localStorage.removeItem('pathnexis_user');
    setToken(null);
    setUser(null);
    window.location.href = '/login';
  };

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('pathnexis_user', JSON.stringify(userData));
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateUser, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
