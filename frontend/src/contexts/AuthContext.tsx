import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import axios from 'axios';

interface PendingEmailChange {
  email: string;
  expiresAt: string;
}

interface User {
  id: number;
  username: string;
  email: string;
  organizerName?: string | null;
  isAdmin: boolean;
  createdAt: string;
  pendingEmailChange?: PendingEmailChange | null;
}

interface CompleteRegistrationInput {
  token: string;
  username: string;
  password: string;
  organizerName?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (identifier: string, password: string) => Promise<void>;
  requestRegistration: (email: string) => Promise<void>;
  completeRegistration: (input: CompleteRegistrationInput) => Promise<void>;
  refreshProfile: () => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true); // 初期ローディング状態をtrueに
  const [error, setError] = useState<string | null>(null);

  // Axiosのデフォルト設定
  axios.defaults.baseURL = API_URL;
  axios.defaults.headers.common['Authorization'] = token ? `Bearer ${token}` : '';

  // セッション復元機能
  useEffect(() => {
    const restoreSession = async () => {
      console.log('AuthContext - セッション復元開始');
      const savedToken = localStorage.getItem('token');
      console.log('AuthContext - 保存されたトークン:', savedToken ? 'あり' : 'なし');
      
      if (savedToken) {
        try {
          // トークンをヘッダーに設定
          axios.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
          
          // ユーザー情報を取得
          const response = await axios.get('/api/auth/profile');
          console.log('AuthContext - ユーザー情報取得成功:', response.data.user);
          setUser(response.data.user);
          setToken(savedToken);
        } catch (error) {
          console.log('AuthContext - セッション復元に失敗しました:', error);
          // トークンが無効な場合は削除
          localStorage.removeItem('token');
          delete axios.defaults.headers.common['Authorization'];
        }
      } else {
        console.log('AuthContext - 保存されたトークンがありません');
      }
      console.log('AuthContext - セッション復元完了、isLoadingをfalseに設定');
      setIsLoading(false);
    };

    restoreSession();
  }, []);

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

  const login = async (identifier: string, password: string) => {
    try {
      setError(null);
      setIsLoading(true);
      
      const response = await axios.post('/api/auth/login', {
        username: identifier,
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

  const requestRegistration = async (email: string) => {
    try {
      setError(null);
      setIsLoading(true);
      
      await axios.post('/api/auth/register', {
        email
      });
    } catch (error: any) {
      console.error('Request registration error:', error.response?.data);
      const errorMessage = error.response?.data?.error || '仮登録に失敗しました';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const completeRegistration = async (input: CompleteRegistrationInput) => {
    try {
      setError(null);
      setIsLoading(true);

      const response = await axios.post('/api/auth/complete-registration', {
        token: input.token,
        username: input.username,
        password: input.password,
        organizerName: input.organizerName
      });

      console.log('Complete registration response:', response.data);

      const { user: userData, token: newToken } = response.data;

      setUser(userData);
      setToken(newToken);
    } catch (error: any) {
      console.error('Complete registration error:', error.response?.data);
      const errorMessage = error.response?.data?.error || '本登録に失敗しました';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      // サーバーにログアウトリクエストを送信
      if (token) {
        await axios.post('/api/auth/logout');
      }
    } catch (error) {
      console.log('ログアウトリクエストエラー:', error);
      // エラーが発生してもローカルログアウトは実行
    } finally {
      setUser(null);
      setToken(null);
      setError(null);
    }
  };

  const refreshProfile = useCallback(async () => {
    if (!token) {
      return;
    }

    try {
      const response = await axios.get('/api/auth/profile');
      setUser(response.data.user);
    } catch (error) {
      console.error('Profile refresh error:', error);
    }
  }, [token]);

  const value: AuthContextType = {
    user,
    token,
    login,
    requestRegistration,
    completeRegistration,
    refreshProfile,
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
