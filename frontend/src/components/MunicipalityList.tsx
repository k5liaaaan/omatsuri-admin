import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface Municipality {
  id: number;
  code: string;
  name: string;
  prefectureId: number;
  prefecture: {
    id: number;
    code: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface MunicipalityListProps {
  prefectureId: number;
  onBack: () => void;
}

const MunicipalityList: React.FC<MunicipalityListProps> = ({
  prefectureId,
  onBack
}) => {
  const navigate = useNavigate();
  const [prefectureName, setPrefectureName] = useState<string>('');
  const [municipalities, setMunicipalities] = useState<Municipality[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMunicipalities();
    fetchPrefectureName();
  }, [prefectureId]);

  const fetchPrefectureName = async () => {
    try {
      const response = await axios.get(`/api/region/prefectures/${prefectureId}`);
      setPrefectureName(response.data.data.name);
    } catch (err: any) {
      console.error('Error fetching prefecture name:', err);
    }
  };

  const fetchMunicipalities = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/region/prefectures/${prefectureId}/municipalities`);
      setMunicipalities(response.data.data);
    } catch (err: any) {
      setError('市区町村データの取得に失敗しました');
      console.error('Error fetching municipalities:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMunicipality = () => {
    console.log('Adding municipality for prefecture:', prefectureId);
    navigate(`/region/${prefectureId}/municipalities/new`);
  };

  const handleEditMunicipality = (municipalityId: number) => {
    console.log('Editing municipality:', municipalityId, 'for prefecture:', prefectureId);
    navigate(`/region/${prefectureId}/municipalities/${municipalityId}/edit`);
  };

  if (loading) {
    return (
      <div className="municipality-list">
        {/* ヘッダー */}
        <header className="municipality-header">
          <div className="header-content">
            <div className="header-left">
              <button onClick={onBack} className="back-button">
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                戻る
              </button>
            </div>
            <div className="header-center">
              <h1 className="header-title">読み込み中...</h1>
              <p className="header-subtitle">市区町村一覧</p>
            </div>
            <div className="header-right">
              {/* 読み込み中はボタンを無効化 */}
            </div>
          </div>
        </header>

        {/* メインコンテンツ */}
        <main className="municipality-main">
          <div className="municipality-content">
            <div className="loading">市区町村データを読み込み中...</div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="municipality-list">
        {/* ヘッダー */}
        <header className="municipality-header">
          <div className="header-content">
            <div className="header-left">
              <button onClick={onBack} className="back-button">
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                戻る
              </button>
            </div>
            <div className="header-center">
              <h1 className="header-title">エラー</h1>
              <p className="header-subtitle">市区町村一覧</p>
            </div>
            <div className="header-right">
              {/* エラー時はボタンを無効化 */}
            </div>
          </div>
        </header>

        {/* メインコンテンツ */}
        <main className="municipality-main">
          <div className="municipality-content">
            <div className="error">{error}</div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="municipality-list">
      {/* ヘッダー */}
      <header className="municipality-header">
        <div className="header-content">
          <div className="header-left">
            <button onClick={onBack} className="back-button">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              戻る
            </button>
          </div>
          <div className="header-center">
            <h1 className="header-title">{prefectureName}</h1>
            <p className="header-subtitle">市区町村一覧</p>
          </div>
          <div className="header-right">
            <button onClick={handleAddMunicipality} className="add-button">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              市区町村追加
            </button>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="municipality-main">
        <div className="municipality-content">
          <div className="municipality-section">
                         <div className="section-header">
               <h2 className="section-title">市区町村一覧</h2>
               <p className="section-description">
                 {prefectureName}に登録されている市区町村の一覧です。
               </p>
               <div className="section-stats">
                 <span className="stat-item">
                   登録件数: <strong>{municipalities.length}件</strong>
                 </span>
               </div>
             </div>

            <div className="municipality-table">
              <div className="table-header">
                <div className="table-cell header-cell">コード</div>
                <div className="table-cell header-cell">市区町村名</div>
                <div className="table-cell header-cell">登録日</div>
                <div className="table-cell header-cell">操作</div>
              </div>

              {municipalities.map((municipality) => (
                <div key={municipality.id} className="table-row">
                  <div className="table-cell">{municipality.code}</div>
                  <div className="table-cell">{municipality.name}</div>
                  <div className="table-cell">
                    {new Date(municipality.createdAt).toLocaleDateString('ja-JP')}
                  </div>
                                     <div className="table-cell">
                     <button 
                       className="edit-button"
                       onClick={() => handleEditMunicipality(municipality.id)}
                     >
                       <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                       </svg>
                       編集
                     </button>
                   </div>
                </div>
              ))}
            </div>

            {municipalities.length === 0 && (
              <div className="empty-state">
                <p>市区町村データがありません</p>
                <button onClick={handleAddMunicipality} className="add-first-button">
                  最初の市区町村を追加
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default MunicipalityList;
