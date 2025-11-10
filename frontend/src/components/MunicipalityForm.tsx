import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface MunicipalityFormData {
  name: string;
}

interface MunicipalityFormProps {
  prefectureId: number;
  prefectureName: string;
  municipalityId?: number; // 編集時のみ使用
}

const MunicipalityForm: React.FC<MunicipalityFormProps> = ({
  prefectureId,
  prefectureName,
  municipalityId
}) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<MunicipalityFormData>({
    name: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEdit, setIsEdit] = useState(false);
  const [prefectureNameState, setPrefectureNameState] = useState<string>('');

  useEffect(() => {
    fetchPrefectureName();
    if (municipalityId) {
      setIsEdit(true);
      fetchMunicipality();
    }
  }, [municipalityId, prefectureId]);

  // デバッグ用ログ
  console.log('MunicipalityForm props:', { prefectureId, prefectureName, municipalityId });

  const fetchPrefectureName = async () => {
    try {
      const response = await axios.get(`/api/region/prefectures/${prefectureId}`);
      setPrefectureNameState(response.data.data.name);
    } catch (err: any) {
      console.error('Error fetching prefecture name:', err);
    }
  };

  const fetchMunicipality = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/region/municipalities/${municipalityId}`);
      const municipality = response.data.data;
      setFormData({
        name: municipality.name
      });
    } catch (err: any) {
      setError('市区町村データの取得に失敗しました');
      console.error('Error fetching municipality:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('市区町村名は必須です');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      if (isEdit) {
        // 編集
        await axios.put(`/api/region/municipalities/${municipalityId}`, formData);
      } else {
        // 新規作成
        await axios.post(`/api/region/prefectures/${prefectureId}/municipalities`, formData);
      }

      // 成功時は市区町村一覧に戻る
      navigate(`/region/${prefectureId}`);
    } catch (err: any) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError(isEdit ? '市区町村の更新に失敗しました' : '市区町村の登録に失敗しました');
      }
      console.error('Error saving municipality:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(`/region/${prefectureId}`);
  };

  if (loading && isEdit) {
    return (
      <div className="municipality-form">
        <div className="loading">市区町村データを読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="municipality-form">
      {/* ヘッダー */}
      <header className="municipality-form-header">
        <div className="header-content">
          <div className="header-left">
            <button onClick={handleCancel} className="back-button">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              戻る
            </button>
          </div>
          <div className="header-center">
            <h1 className="header-title">
              {isEdit ? '市区町村編集' : '市区町村登録'}
            </h1>
                         <p className="header-subtitle">
               {prefectureNameState || prefectureName}
             </p>
          </div>
          <div className="header-right">
            {/* 必要に応じて追加のボタンを配置 */}
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="municipality-form-main">
        <div className="municipality-form-content">
          <div className="form-section">
            <div className="section-header">
              <h2 className="section-title">
                {isEdit ? '市区町村情報を編集' : '新しい市区町村を登録'}
              </h2>
                             <p className="section-description">
                 {prefectureNameState || prefectureName}に{isEdit ? '登録されている市区町村の情報を編集' : '新しい市区町村を登録'}します。
               </p>
            </div>

            {error && (
              <div className="error-message">
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}

                         <form onSubmit={handleSubmit} className="municipality-form-form">
               <div className="form-group">
                 <label htmlFor="name" className="form-label">
                   市区町村名 <span className="required">*</span>
                 </label>
                 <input
                   type="text"
                   id="name"
                   name="name"
                   value={formData.name}
                   onChange={handleInputChange}
                   className="form-input"
                   placeholder="例: 千葉市中央区"
                   maxLength={50}
                   disabled={loading}
                 />
                 <p className="form-help">
                   市区町村名を入力してください（例: 千葉市中央区）
                 </p>
               </div>

               

              <div className="form-actions">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="cancel-button"
                  disabled={loading}
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  className="submit-button"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="loading-spinner">
                      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      処理中...
                    </span>
                  ) : (
                    isEdit ? '更新' : '登録'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MunicipalityForm;
