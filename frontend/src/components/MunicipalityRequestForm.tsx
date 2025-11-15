import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

interface Prefecture {
  id: number;
  name: string;
}

const MunicipalityRequestForm: React.FC = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [prefectures, setPrefectures] = useState<Prefecture[]>([]);
  const [selectedPrefectureId, setSelectedPrefectureId] = useState<number>(0);
  const [municipalityName, setMunicipalityName] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successData, setSuccessData] = useState<{ prefectureName: string; municipalityName: string } | null>(null);

  useEffect(() => {
    fetchPrefectures();
  }, []);

  const fetchPrefectures = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/region/prefectures');
      if (response.data.success && Array.isArray(response.data.data)) {
        setPrefectures(response.data.data);
      } else if (Array.isArray(response.data)) {
        setPrefectures(response.data);
      }
    } catch (err: any) {
      console.error('都道府県取得エラー:', err);
      setError('都道府県の取得に失敗しました');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!selectedPrefectureId) {
      setError('都道府県を選択してください');
      setLoading(false);
      return;
    }

    if (!municipalityName.trim()) {
      setError('市区町村名を入力してください');
      setLoading(false);
      return;
    }

    try {
      const selectedPrefecture = prefectures.find(p => p.id === selectedPrefectureId);
      
      const response = await axios.post(
        'http://localhost:3001/api/region/municipality-requests',
        {
          prefectureId: selectedPrefectureId,
          name: municipalityName.trim()
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        setSuccessData({
          prefectureName: selectedPrefecture?.name || '',
          municipalityName: municipalityName.trim()
        });
        setShowSuccessModal(true);
        setMunicipalityName('');
        setSelectedPrefectureId(0);
      } else {
        setError(response.data.message || 'リクエストの送信に失敗しました');
      }
    } catch (err: any) {
      console.error('リクエスト送信エラー:', err);
      setError(err.response?.data?.message || 'リクエストの送信に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToTop = () => {
    navigate('/');
  };

  return (
    <div style={{ 
      padding: '2rem', 
      backgroundColor: '#f0f0f0', 
      minHeight: '100vh'
    }}>
      <div style={{ 
        backgroundColor: 'white', 
        padding: '2rem', 
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        maxWidth: '600px',
        margin: '0 auto'
      }}>
        <h1 style={{ color: '#333', marginBottom: '1rem' }}>
          市区町村追加リクエスト
        </h1>
        
        <p style={{ color: '#666', marginBottom: '2rem' }}>
          該当する市区町村がない場合、追加リクエストを送信できます。
        </p>

        {error && (
          <div style={{ 
            backgroundColor: '#f8d7da', 
            color: '#721c24', 
            padding: '1rem', 
            marginBottom: '1rem', 
            borderRadius: '4px',
            border: '1px solid #f5c6cb'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              都道府県 <span style={{ color: 'red' }}>*</span>
            </label>
            <select
              value={selectedPrefectureId}
              onChange={(e) => setSelectedPrefectureId(parseInt(e.target.value))}
              required
              style={{ 
                width: '100%', 
                padding: '0.5rem', 
                border: '1px solid #ddd', 
                borderRadius: '4px' 
              }}
            >
              <option value="0">都道府県を選択してください</option>
              {prefectures.map((prefecture) => (
                <option key={prefecture.id} value={prefecture.id}>
                  {prefecture.name}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              市区町村名 <span style={{ color: 'red' }}>*</span>
            </label>
            <input
              type="text"
              value={municipalityName}
              onChange={(e) => setMunicipalityName(e.target.value)}
              required
              placeholder="例：千葉市中央区"
              style={{ 
                width: '100%', 
                padding: '0.5rem', 
                border: '1px solid #ddd', 
                borderRadius: '4px' 
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={() => navigate(-1)}
              disabled={loading}
              style={{ 
                padding: '0.75rem 1.5rem', 
                border: '1px solid #ddd', 
                borderRadius: '4px', 
                backgroundColor: '#f8f9fa',
                cursor: 'pointer'
              }}
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{ 
                padding: '0.75rem 1.5rem', 
                border: 'none', 
                borderRadius: '4px', 
                backgroundColor: '#007bff',
                color: 'white',
                cursor: 'pointer'
              }}
            >
              {loading ? '送信中...' : 'リクエストを送信'}
            </button>
          </div>
        </form>
      </div>

      {/* 成功モーダル */}
      {showSuccessModal && successData && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '8px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
            maxWidth: '500px',
            width: '90%',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '3rem',
              color: '#28a745',
              marginBottom: '1rem'
            }}>
              ✅
            </div>
            <h2 style={{
              color: '#333',
              marginBottom: '1rem',
              fontSize: '1.5rem'
            }}>
              {successData.prefectureName}{successData.municipalityName}の追加リクエストを送信しました
            </h2>
            <p style={{
              color: '#666',
              marginBottom: '2rem',
              lineHeight: '1.5'
            }}>
              登録までしばらくお待ちください
            </p>
            <button
              onClick={handleBackToTop}
              style={{
                padding: '0.75rem 2rem',
                border: 'none',
                borderRadius: '4px',
                backgroundColor: '#007bff',
                color: 'white',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: 'bold'
              }}
            >
              管理画面へ戻る（TOPへ）
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MunicipalityRequestForm;

