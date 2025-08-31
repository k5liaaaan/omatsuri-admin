import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import LoginForm from './LoginForm';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, isLoading } = useAuth();

  console.log('ProtectedRoute - isLoading:', isLoading, 'user:', user);

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="text-center">
          <div className="loading-spinner"></div>
          <p className="loading-text">セッションを復元中...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    console.log('ProtectedRoute - ユーザーが認証されていないため、ログインフォームを表示');
    return <LoginForm />;
  }

  console.log('ProtectedRoute - ユーザーが認証されているため、子コンポーネントを表示');
  return <>{children}</>;
};

export default ProtectedRoute;
