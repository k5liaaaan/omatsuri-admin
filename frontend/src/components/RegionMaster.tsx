import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface Prefecture {
  id: number;
  code: string;
  name: string;
  municipalities: Municipality[];
  createdAt: string;
  updatedAt: string;
}

interface Municipality {
  id: number;
  code: string;
  name: string;
  prefectureId: number;
  createdAt: string;
  updatedAt: string;
}

interface RegionMasterProps {
  onPrefectureClick: (prefecture: Prefecture) => void;
}

const RegionMaster: React.FC<RegionMasterProps> = ({ onPrefectureClick }) => {
  const navigate = useNavigate();
  const [prefectures, setPrefectures] = useState<Prefecture[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPrefectures();
  }, []);

  const fetchPrefectures = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/region/prefectures');
      setPrefectures(response.data.data);
    } catch (err: any) {
      setError('都道府県データの取得に失敗しました');
      console.error('Error fetching prefectures:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrefectureClick = (prefecture: Prefecture) => {
    onPrefectureClick(prefecture);
  };

  if (loading) {
    return (
      <div className="region-master">
        <div className="loading">読み込み中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="region-master">
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="region-master">
      {/* ヘッダー */}
      <header className="region-header">
        <div className="header-content">
          <div className="header-left">
            <button onClick={() => navigate('/')} className="back-button">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              ダッシュボードに戻る
            </button>
          </div>
          <div className="header-center">
            <h1 className="header-title">地域マスター</h1>
            <p className="header-subtitle">都道府県・市区町村管理</p>
          </div>
          <div className="header-right">
            {/* 必要に応じて追加のボタンを配置 */}
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="region-main">
        <div className="region-content">
          <div className="region-section">
            <h2 className="section-title">都道府県一覧</h2>
            <p className="section-description">
              都道府県をクリックすると、その都道府県の市区町村一覧を表示します。
            </p>

            <div className="prefecture-grid">
              {prefectures.map((prefecture) => (
                                 <div
                   key={prefecture.id}
                   className="prefecture-card"
                   onClick={() => handlePrefectureClick(prefecture)}
                 >
                  <div className="prefecture-code">{prefecture.code}</div>
                  <div className="prefecture-name">{prefecture.name}</div>
                  <div className="prefecture-count">
                    {prefecture.municipalities.length}件の市区町村
                  </div>
                  <div className="prefecture-arrow">
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              ))}
            </div>

            {prefectures.length === 0 && (
              <div className="empty-state">
                <p>都道府県データがありません</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default RegionMaster;
