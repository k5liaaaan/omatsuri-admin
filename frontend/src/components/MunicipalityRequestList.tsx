import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

interface MunicipalityRequest {
  id: number;
  prefectureId: number;
  name: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  prefecture: {
    id: number;
    name: string;
  };
}

const MunicipalityRequestList: React.FC = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [requests, setRequests] = useState<MunicipalityRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 管理者チェック
    if (!user?.isAdmin) {
      navigate('/');
      return;
    }
    fetchRequests();
  }, [user, navigate]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!token) {
        setError('ログインが必要です');
        navigate('/login');
        return;
      }

      const response = await axios.get('/api/region/municipality-requests', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success && Array.isArray(response.data.data)) {
        setRequests(response.data.data);
      } else if (Array.isArray(response.data)) {
        setRequests(response.data);
      }
    } catch (err: any) {
      console.error('市区町村リクエスト一覧の取得に失敗しました:', err);
      if (err.response?.status === 401) {
        setError('ログインが必要です');
        navigate('/login');
      } else if (err.response?.status === 403) {
        setError('管理者権限が必要です');
        navigate('/');
      } else {
        setError('市区町村リクエスト一覧の取得に失敗しました');
      }
    } finally {
      setLoading(false);
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
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return '待機中';
      case 'approved':
        return '承認済み';
      case 'rejected':
        return '却下';
      default:
        return status;
    }
  };

  if (!user?.isAdmin) {
    return null;
  }

  return (
    <div className="municipality-request-list">
      {/* ヘッダー */}
      <header className="municipality-request-list-header">
        <div className="header-content">
          <div>
            <h1 className="header-title">
              市区町村リクエスト
            </h1>
            <p className="header-subtitle">
              市区町村追加リクエストの一覧
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
      <main className="municipality-request-list-main">
        <div className="municipality-request-list-content">
          {loading ? (
            <div className="loading">
              <div className="loading-spinner"></div>
              <p className="loading-text">市区町村リクエスト一覧を読み込み中...</p>
            </div>
          ) : error ? (
            <div className="error">
              <p>{error}</p>
              <button onClick={fetchRequests} className="retry-button">
                再試行
              </button>
            </div>
          ) : requests.length === 0 ? (
            <div className="no-requests">
              <h2>市区町村リクエスト一覧</h2>
              <p>リクエストはありません。</p>
            </div>
          ) : (
            <div className="requests-container">
              <div className="section-header">
                <h2 className="section-title">市区町村リクエスト一覧 ({requests.length}件)</h2>
              </div>
              <div className="requests-list">
                {requests.map((request) => (
                  <div 
                    key={request.id} 
                    className={`request-item ${request.status === 'pending' ? 'pending' : ''}`}
                  >
                    {request.status === 'pending' && (
                      <div className="request-highlight-bar"></div>
                    )}
                    <div className="request-main">
                      <div className="request-info">
                        <div className="request-header">
                          <h3 className="request-name">
                            {request.prefecture.name} {request.name}
                          </h3>
                          <span 
                            className={`status-badge status-${request.status}`}
                          >
                            {getStatusLabel(request.status)}
                          </span>
                        </div>
                        <div className="request-details">
                          <div className="request-detail-row">
                            <span className="request-label">都道府県:</span>
                            <span className="request-value">{request.prefecture.name}</span>
                          </div>
                          <div className="request-detail-row">
                            <span className="request-label">市区町村名:</span>
                            <span className="request-value">{request.name}</span>
                          </div>
                          <div className="request-detail-row">
                            <span className="request-label">リクエスト日時:</span>
                            <span className="request-value">{formatDate(request.createdAt)}</span>
                          </div>
                        </div>
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

export default MunicipalityRequestList;

