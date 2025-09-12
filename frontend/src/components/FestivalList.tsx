import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface Festival {
  id: number;
  name: string;
  address: string;
  createdAt: string;
  updatedAt: string;
  municipality: {
    id: number;
    name: string;
    prefecture: {
      id: number;
      name: string;
    };
  };
  organizer: {
    id: number;
    username: string;
  };
  schedules: {
    id: number;
    date: string;
    startTime: string;
    endTime: string;
  }[];
}

const FestivalList: React.FC = () => {
  const navigate = useNavigate();
  const [festivals, setFestivals] = useState<Festival[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFestivals();
  }, []);

  const fetchFestivals = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:3001/api/festivals');
      setFestivals(response.data);
    } catch (err) {
      console.error('お祭り一覧の取得に失敗しました:', err);
      setError('お祭り一覧の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleBackClick = () => {
    navigate('/');
  };

  const handleFestivalClick = (festivalId: number) => {
    navigate(`/festivals/${festivalId}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatScheduleRange = (schedules: Festival['schedules']) => {
    if (schedules.length === 0) return '';
    if (schedules.length === 1) {
      return formatDate(schedules[0].date);
    }
    
    const sortedSchedules = [...schedules].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    const firstDate = formatDate(sortedSchedules[0].date);
    const lastDate = formatDate(sortedSchedules[sortedSchedules.length - 1].date);
    
    return `${firstDate} ～ ${lastDate}`;
  };

  return (
    <div className="festival-list">
      {/* ヘッダー */}
      <header className="festival-list-header">
        <div className="header-content">
          <div>
            <h1 className="header-title">
              お祭り一覧
            </h1>
            <p className="header-subtitle">
              登録されているお祭りの一覧を表示します
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
      <main className="festival-list-main">
        <div className="festival-list-content">
          {loading ? (
            <div className="loading">
              <p>お祭り一覧を読み込み中...</p>
            </div>
          ) : error ? (
            <div className="error">
              <p>{error}</p>
              <button onClick={fetchFestivals} className="retry-button">
                再試行
              </button>
            </div>
          ) : festivals.length === 0 ? (
            <div className="no-festivals">
              <h2>お祭り一覧</h2>
              <p>登録されているお祭りはありません。</p>
            </div>
          ) : (
            <div className="festivals-container">
              <h2>お祭り一覧 ({festivals.length}件)</h2>
              <div className="festivals-list">
                {festivals.map((festival) => (
                  <div 
                    key={festival.id} 
                    className="festival-item"
                    onClick={() => handleFestivalClick(festival.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="festival-main">
                      <h3 className="festival-name">{festival.name}</h3>
                      <div className="festival-details">
                        <div className="festival-schedule">
                          {formatScheduleRange(festival.schedules)}
                        </div>
                        <div className="festival-location">
                          {festival.municipality.prefecture.name} {festival.municipality.name}
                          {festival.address && ` ${festival.address}`}
                        </div>
                      </div>
                    </div>
                    <div className="festival-meta">
                      <div className="festival-info">
                        <div className="festival-organizer">
                          主催: {festival.organizer.username}
                        </div>
                        <div className="festival-created">
                          {formatDate(festival.createdAt)}
                        </div>
                      </div>
                      <div className="festival-arrow">
                        <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
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

export default FestivalList;
