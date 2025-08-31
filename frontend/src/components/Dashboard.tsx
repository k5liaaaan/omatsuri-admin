import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
  };

  const handleRegionMasterClick = () => {
    navigate('/region');
  };

  return (
    <div className="dashboard">
      {/* ヘッダー */}
      <header className="dashboard-header">
        <div className="header-content">
          <div>
            <h1 className="header-title">
              Omatsuri Nav
            </h1>
            <p className="header-subtitle">
              お祭りナビゲーションシステム
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div className="user-info">
              <p className="user-name">
                {user?.username}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="logout-button"
            >
              ログアウト
            </button>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="dashboard-main">
        <div className="dashboard-content">
          <h2 className="welcome-title">
            ようこそ、{user?.username}さん！
          </h2>
          <p className="welcome-text">
            ログインしました。お祭り情報をご覧いただけます。
          </p>
          
          {/* ユーザー情報カード */}
          <div className="user-card">
            <h3 className="user-card-title">
              ユーザー情報
            </h3>
            <div>
              <div className="user-info-row">
                <span className="user-info-label">ユーザー名:</span>
                <span className="user-info-value">{user?.username}</span>
              </div>

              <div className="user-info-row">
                <span className="user-info-label">登録日:</span>
                <span className="user-info-value">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('ja-JP') : '-'}
                </span>
              </div>
            </div>
          </div>

          {/* 管理者機能カード */}
          {user?.isAdmin && (
            <div className="admin-section">
              <h3 className="admin-section-title">管理者機能</h3>
              <div className="feature-grid">
                <div className="feature-card admin-card" onClick={handleRegionMasterClick}>
                  <div className="feature-icon">
                    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h3 className="feature-title">
                    地域マスター
                  </h3>
                  <p className="feature-description">
                    都道府県・市区町村の管理
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 一般機能カード */}
          <div className="feature-section">
            <h3 className="feature-section-title">一般機能</h3>
            <div className="feature-grid">
              <div className="feature-card">
                <div className="feature-icon">
                  <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="feature-title">
                  お祭り検索
                </h3>
                <p className="feature-description">
                  地域やカテゴリからお祭りを検索できます
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">
                  <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m-6 3l6-3" />
                  </svg>
                </div>
                <h3 className="feature-title">
                  お祭り一覧
                </h3>
                <p className="feature-description">
                  登録されているお祭りの一覧を表示します
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">
                  <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </div>
                <h3 className="feature-title">
                  お気に入り
                </h3>
                <p className="feature-description">
                  お気に入りのお祭りを保存できます
                </p>
              </div>
            </div>
          </div>

          <div className="footer-text">
            各機能は今後実装予定です。お楽しみに！
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
