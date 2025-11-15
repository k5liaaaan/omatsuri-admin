import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import DeleteConfirmModal from './DeleteConfirmModal';
import UnpublishConfirmModal from './UnpublishConfirmModal';

interface Festival {
  id: number;
  name: string;
  address: string;
  content: string;
  foodStalls: string | null;
  sponsors: string | null;
  isVisible: boolean;
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
    organizerName: string | null;
  };
  schedules: {
    id: number;
    date: string;
    startTime: string;
    endTime: string;
  }[];
}

const FestivalDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [festival, setFestival] = useState<Festival | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState<string | null>(null);
  const [showUnpublishModal, setShowUnpublishModal] = useState(false);
  const [isUnpublishing, setIsUnpublishing] = useState(false);
  const [unpublishMessage, setUnpublishMessage] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchFestival();
    }
  }, [id]);

  const fetchFestival = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:3001/api/festivals/${id}`);
      setFestival(response.data);
    } catch (err: any) {
      console.error('お祭り詳細の取得に失敗しました:', err);
      if (err.response?.status === 404) {
        setError('お祭りが見つかりません');
      } else {
        setError('お祭り詳細の取得に失敗しました');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBackClick = () => {
    navigate('/festivals');
  };

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!festival) return;

    try {
      setIsDeleting(true);
      const token = localStorage.getItem('token');
      
      await axios.delete(`http://localhost:3001/api/festivals/${festival.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setDeleteMessage('お祭りが正常に削除されました');
      setShowDeleteModal(false);
      
      // 2秒後にメッセージを表示してからお祭り一覧に遷移
      setTimeout(() => {
        navigate('/festivals');
      }, 2000);

    } catch (err: any) {
      console.error('削除エラー:', err);
      setError('お祭りの削除に失敗しました');
      setShowDeleteModal(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
  };

  const handleUnpublishClick = () => {
    setShowUnpublishModal(true);
  };

  const handleUnpublishConfirm = async () => {
    if (!festival) return;

    try {
      setIsUnpublishing(true);
      const token = localStorage.getItem('token');
      
      await axios.patch(`http://localhost:3001/api/festivals/${festival.id}/unpublish`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setUnpublishMessage('お祭りを非公開に設定しました');
      setShowUnpublishModal(false);
      
      // 2秒後にメッセージを表示してからお祭り一覧に遷移
      setTimeout(() => {
        navigate('/festivals');
      }, 2000);

    } catch (err: any) {
      console.error('非公開設定エラー:', err);
      setError('お祭りの非公開設定に失敗しました');
      setShowUnpublishModal(false);
    } finally {
      setIsUnpublishing(false);
    }
  };

  const handleUnpublishCancel = () => {
    setShowUnpublishModal(false);
  };

  const handleEditClick = () => {
    if (festival) {
      // 編集ページに遷移（お祭りIDをパラメータとして渡す）
      navigate(`/festivals/${festival.id}/edit`);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5); // HH:MM形式に変換
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

  if (loading) {
    return (
      <div className="festival-detail">
        <div className="loading">
          <p>お祭り詳細を読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error || !festival) {
    return (
      <div className="festival-detail">
        <div className="error">
          <p>{error}</p>
          <button onClick={handleBackClick} className="back-button">
            ← お祭り一覧に戻る
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="festival-detail">
      {/* ヘッダー */}
      <header className="festival-detail-header">
        <div className="header-content">
          <div>
            <h1 className="header-title">
              {festival.name}
            </h1>
            <p className="header-subtitle">
              お祭り詳細情報
            </p>
          </div>
          <button
            onClick={handleBackClick}
            className="back-button"
          >
            ← お祭り一覧に戻る
          </button>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="festival-detail-main">
        <div className="festival-detail-content">
          {/* 公開状態 */}
          <section className="visibility-status-section">
            <div className="visibility-status">
              <div className={`status-badge ${festival.isVisible ? 'public' : 'private'}`}>
                <span className="status-icon">
                  {festival.isVisible ? '🌐' : '🔒'}
                </span>
                <span className="status-text">
                  {festival.isVisible ? '公開中' : '非公開'}
                </span>
              </div>
              <p className="status-description">
                {festival.isVisible 
                  ? 'このお祭りは一般ユーザーに公開されています' 
                  : 'このお祭りは非公開設定されており、一般ユーザーには表示されません'
                }
              </p>
            </div>
          </section>

          {/* 基本情報 */}
          <section className="festival-info-section">
            <h2>基本情報</h2>
            <div className="info-grid">
              <div className="info-item">
                <label>開催期間</label>
                <div className="info-value">
                  {formatScheduleRange(festival.schedules)}
                </div>
              </div>
              <div className="info-item">
                <label>開催場所</label>
                <div className="info-value">
                  {festival.municipality.prefecture.name} {festival.municipality.name}
                  {festival.address && ` ${festival.address}`}
                </div>
              </div>
              <div className="info-item">
                <label>主催者</label>
                <div className="info-value">
                  {festival.organizer.organizerName || '未設定'}
                </div>
              </div>
              <div className="info-item">
                <label>登録日</label>
                <div className="info-value">
                  {formatDate(festival.createdAt)}
                </div>
              </div>
            </div>
          </section>

          {/* 詳細スケジュール */}
          {festival.schedules.length > 0 && (
            <section className="schedule-section">
              <h2>詳細スケジュール</h2>
              <div className="schedule-list">
                {festival.schedules.map((schedule) => (
                  <div key={schedule.id} className="schedule-item">
                    <div className="schedule-date">
                      {formatDate(schedule.date)}
                    </div>
                    <div className="schedule-time">
                      {formatTime(schedule.startTime)} ～ {formatTime(schedule.endTime)}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* お祭り内容 */}
          {festival.content && (
            <section className="content-section">
              <h2>お祭り内容</h2>
              <div className="content-text">
                {festival.content}
              </div>
            </section>
          )}

          {/* 屋台情報 */}
          {festival.foodStalls && (
            <section className="food-stalls-section">
              <h2>屋台情報</h2>
              <div className="content-text">
                {festival.foodStalls}
              </div>
            </section>
          )}

          {/* スポンサー情報 */}
          {festival.sponsors && (
            <section className="sponsors-section">
              <h2>スポンサー情報</h2>
              <div className="content-text">
                {festival.sponsors}
              </div>
            </section>
          )}

          {/* アクションボタン */}
          <section className="action-section">
            <div className="action-buttons">
              <button 
                className="action-button edit-button"
                onClick={handleEditClick}
              >
                <span className="button-icon">✏️</span>
                編集
              </button>
              <button 
                className="action-button unpublish-button"
                onClick={handleUnpublishClick}
              >
                <span className="button-icon">👁️‍🗨️</span>
                非公開
              </button>
              <button 
                className="action-button delete-button"
                onClick={handleDeleteClick}
              >
                <span className="button-icon">🗑️</span>
                削除
              </button>
            </div>
          </section>
        </div>
      </main>

      {/* 削除確認モーダル */}
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        festivalName={festival?.name || ''}
        isLoading={isDeleting}
      />

      {/* 非公開確認モーダル */}
      <UnpublishConfirmModal
        isOpen={showUnpublishModal}
        onClose={handleUnpublishCancel}
        onConfirm={handleUnpublishConfirm}
        festivalName={festival?.name || ''}
        isLoading={isUnpublishing}
      />

      {/* 削除完了メッセージ */}
      {deleteMessage && (
        <div className="delete-success-message">
          <div className="success-content">
            <span className="success-icon">✅</span>
            <p>{deleteMessage}</p>
          </div>
        </div>
      )}

      {/* 非公開設定完了メッセージ */}
      {unpublishMessage && (
        <div className="unpublish-success-message">
          <div className="success-content">
            <span className="success-icon">👁️‍🗨️</span>
            <p>{unpublishMessage}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default FestivalDetail;
