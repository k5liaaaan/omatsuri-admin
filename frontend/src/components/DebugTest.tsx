import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const DebugTest: React.FC = () => {
  const { user, isLoading, error } = useAuth();

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundColor: '#f3f4f6',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ 
        background: 'white', 
        padding: '2rem', 
        borderRadius: '0.5rem',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        textAlign: 'center',
        maxWidth: '500px'
      }}>
        <h1 style={{ color: '#1f2937', marginBottom: '1rem' }}>
          認証デバッグテスト
        </h1>
        <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
          認証コンテキストの状態を確認しています
        </p>
        
        <div style={{ 
          background: '#dbeafe', 
          padding: '1rem', 
          borderRadius: '0.375rem',
          border: '1px solid #3b82f6',
          marginBottom: '1rem'
        }}>
          <p style={{ color: '#1e40af', margin: 0, fontWeight: 'bold' }}>
            ✅ React 動作確認済み
          </p>
        </div>
        
        <div style={{ 
          background: '#d1fae5', 
          padding: '1rem', 
          borderRadius: '0.375rem',
          border: '1px solid #10b981',
          marginBottom: '1rem'
        }}>
          <p style={{ color: '#065f46', margin: 0, fontWeight: 'bold' }}>
            🔄 認証状態: {isLoading ? '読み込み中...' : (user ? 'ログイン済み' : '未ログイン')}
          </p>
        </div>
        
        {user && (
          <div style={{ 
            background: '#fef3c7', 
            padding: '1rem', 
            borderRadius: '0.375rem',
            border: '1px solid #f59e0b',
            marginBottom: '1rem'
          }}>
            <p style={{ color: '#92400e', margin: 0 }}>
              ユーザー: {user.username} ({user.email})
            </p>
          </div>
        )}
        
        {error && (
          <div style={{ 
            background: '#fee2e2', 
            padding: '1rem', 
            borderRadius: '0.375rem',
            border: '1px solid #ef4444',
            marginBottom: '1rem'
          }}>
            <p style={{ color: '#991b1b', margin: 0 }}>
              エラー: {error}
            </p>
          </div>
        )}
        
        <div style={{ 
          background: '#fef3c7', 
          padding: '1rem', 
          borderRadius: '0.375rem',
          border: '1px solid #f59e0b'
        }}>
          <p style={{ color: '#92400e', margin: 0 }}>
            次のステップ: ログインフォームのテスト
          </p>
        </div>
      </div>
    </div>
  );
};

export default DebugTest;
