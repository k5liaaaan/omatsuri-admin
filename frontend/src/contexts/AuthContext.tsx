import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

interface User {
  id: number;
  username: string;
  email: string;
  isAdmin: boolean;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Axiosのデフォルト設定
  axios.defaults.baseURL = API_URL;
  axios.defaults.headers.common['Authorization'] = token ? `Bearer ${token}` : '';

  // トークンが変更されたときにヘッダーを更新
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('token', token);
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
    }
  }, [token]);

  const login = async (username: string, password: string) => {
    try {
      setError(null);
      setIsLoading(true);
      
      const response = await axios.post('/api/auth/login', {
        username,
        password
      });

      console.log('Login response:', response.data); // デバッグ用
      
      const { user: userData, token: newToken } = response.data;
      
      setUser(userData);
      setToken(newToken);
    } catch (error: any) {
      console.error('Login error:', error.response?.data); // デバッグ用
      const errorMessage = error.response?.data?.error || 'ログインに失敗しました';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (username: string, password: string) => {
    try {
      setError(null);
      setIsLoading(true);
      
      const response = await axios.post('/api/auth/register', {
        username,
        email: `${username}@example.com`, // ダミーメールアドレス
        password
      });

      console.log('Register response:', response.data); // デバッグ用
      
      const { user: userData, token: newToken } = response.data;
      
      setUser(userData);
      setToken(newToken);
    } catch (error: any) {
      console.error('Register error:', error.response?.data); // デバッグ用
      const errorMessage = error.response?.data?.error || 'アカウント作成に失敗しました';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setError(null);
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    logout,
    isLoading,
    error
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
