import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const pendingEmailChange = user?.pendingEmailChange || null;

  const handleLogout = () => {
    logout();
  };

  const handleRegionMasterClick = () => {
    navigate('/region');
  };

  const handleFestivalRegisterClick = () => {
    console.log('お祭り登録ボタンがクリックされました');
    navigate('/festival/new');
  };


  const handleFestivalListClick = () => {
    console.log('お祭り一覧ボタンがクリックされました');
    navigate('/festivals');
  };

  const handleProfileEditClick = () => {
    navigate('/profile/edit');
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
          <div className="header-user-info">
            <div className="user-info">
              <p className="user-name">
                {user?.organizerName ? `${user.organizerName}（${user.username}）` : user?.username}
              </p>
              <p className="user-email">
                {user?.email}
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
                <span className="user-info-label">主催団体名:</span>
                <span className="user-info-value">{user?.organizerName || '未登録'}</span>
              </div>

              <div className="user-info-row">
                <span className="user-info-label">ユーザー名:</span>
                <span className="user-info-value">{user?.username}</span>
              </div>

              <div className="user-info-row">
                <span className="user-info-label">メールアドレス:</span>
                <span className="user-info-value">{user?.email}</span>
              </div>

              <div className="user-info-row">
                <span className="user-info-label">登録日:</span>
                <span className="user-info-value">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('ja-JP') : '-'}
                </span>
              </div>
            </div>

            {pendingEmailChange && (
              <div className="pending-email-notice">
                <p>
                  新しいメールアドレス <strong>{pendingEmailChange.email}</strong> の確認待ちです。
                </p>
                <p>
                  有効期限: {new Date(pendingEmailChange.expiresAt).toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })}
                </p>
                <p>メール内のリンクを開くと変更が完了します。</p>
              </div>
            )}

            <button className="primary-button profile-edit-link" onClick={handleProfileEditClick}>
              プロフィールを編集
            </button>
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
                <div className="feature-card" onClick={handleFestivalRegisterClick} style={{ cursor: 'pointer' }}>
                  <div className="feature-icon">
                    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <h3 className="feature-title">
                    お祭り登録
                  </h3>
                  <p className="feature-description">
                    新しいお祭りの情報を登録
                  </p>
                </div>


                              <div className="feature-card" onClick={handleFestivalListClick} style={{ cursor: 'pointer' }}>
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
