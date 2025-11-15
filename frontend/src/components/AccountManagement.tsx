import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

interface User {
  id: number;
  username: string;
  email: string;
  organizerName: string | null;
  isAdmin: boolean;
  createdAt: string;
  updatedAt: string;
}

const AccountManagement: React.FC = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    // 管理者チェック
    if (!user?.isAdmin) {
      navigate('/');
      return;
    }
    fetchUsers();
  }, [user, navigate]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!token) {
        setError('ログインが必要です');
        navigate('/login');
        return;
      }

      const response = await axios.get('/api/user/accounts', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setUsers(response.data.data);
    } catch (err: any) {
      console.error('ユーザー一覧の取得に失敗しました:', err);
      if (err.response?.status === 401) {
        setError('ログインが必要です');
        navigate('/login');
      } else if (err.response?.status === 403) {
        setError('管理者権限が必要です');
        navigate('/');
      } else {
        setError('ユーザー一覧の取得に失敗しました');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId: number, username: string) => {
    if (!window.confirm(`ユーザー「${username}」を削除してもよろしいですか？\nこの操作は取り消せません。`)) {
      return;
    }

    try {
      setDeletingId(userId);
      setError(null);

      if (!token) {
        setError('ログインが必要です');
        return;
      }

      await axios.delete(`/api/user/accounts/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      // 一覧を再取得
      await fetchUsers();
    } catch (err: any) {
      console.error('ユーザーの削除に失敗しました:', err);
      if (err.response?.status === 401) {
        setError('ログインが必要です');
        navigate('/login');
      } else if (err.response?.status === 403) {
        setError('管理者権限が必要です');
      } else if (err.response?.status === 400) {
        setError(err.response.data.error || 'ユーザーの削除に失敗しました');
      } else {
        setError('ユーザーの削除に失敗しました');
      }
    } finally {
      setDeletingId(null);
    }
  };

  const handleBackClick = () => {
    navigate('/');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!user?.isAdmin) {
    return null;
  }

  return (
    <div className="account-management">
      {/* ヘッダー */}
      <header className="account-management-header">
        <div className="header-content">
          <div>
            <h1 className="header-title">
              アカウント管理
            </h1>
            <p className="header-subtitle">
              登録されているユーザーアカウントの一覧と管理
            </p>
          </div>
          <button
            onClick={handleBackClick}
            className="back-button"
          >
            ← 前に戻る
          </button>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="account-management-main">
        <div className="account-management-content">
          {loading ? (
            <div className="loading">
              <p>ユーザー一覧を読み込み中...</p>
            </div>
          ) : error ? (
            <div className="error">
              <p>{error}</p>
              <button onClick={fetchUsers} className="retry-button">
                再試行
              </button>
            </div>
          ) : users.length === 0 ? (
            <div className="no-users">
              <h2>アカウント一覧</h2>
              <p>登録されているユーザーはありません。</p>
            </div>
          ) : (
            <div className="accounts-container">
              <h2>アカウント一覧 ({users.length}件)</h2>
              <div className="accounts-list">
                {users.map((account) => (
                  <div 
                    key={account.id} 
                    className="account-item"
                  >
                    <div className="account-main">
                      <div className="account-info">
                        <div className="account-header">
                          <h3 className="account-username">{account.username}</h3>
                          {account.isAdmin && (
                            <span className="admin-badge">
                              管理者
                            </span>
                          )}
                        </div>
                        <div className="account-details">
                          <div className="account-detail-row">
                            <span className="account-label">メールアドレス:</span>
                            <span className="account-value">{account.email}</span>
                          </div>
                          {account.organizerName && (
                            <div className="account-detail-row">
                              <span className="account-label">主催団体名:</span>
                              <span className="account-value">{account.organizerName}</span>
                            </div>
                          )}
                          <div className="account-detail-row">
                            <span className="account-label">登録日:</span>
                            <span className="account-value">{formatDate(account.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="account-actions">
                        {account.id !== user.id && !account.isAdmin && (
                          <button
                            onClick={() => handleDelete(account.id, account.username)}
                            className="delete-button"
                            disabled={deletingId === account.id}
                          >
                            {deletingId === account.id ? '削除中...' : '削除'}
                          </button>
                        )}
                        {account.id === user.id && (
                          <span className="current-user-label">現在のユーザー</span>
                        )}
                        {account.isAdmin && account.id !== user.id && (
                          <span className="current-user-label">管理者アカウント</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AccountManagement;

