import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import FestivalForm from './FestivalForm';

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
  };
  schedules: {
    id: number;
    date: string;
    startTime: string;
    endTime: string;
  }[];
}

const FestivalEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [festival, setFestival] = useState<Festival | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    navigate(`/festivals/${id}`);
  };

  if (loading) {
    return (
      <div className="festival-edit-page">
        <div className="loading">
          <p>お祭り詳細を読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error || !festival) {
    return (
      <div className="festival-edit-page">
        <div className="error">
          <p>{error}</p>
          <button onClick={handleBackClick} className="back-button">
            ← お祭り詳細に戻る
          </button>
        </div>
      </div>
    );
  }

  // フォーム用の初期データを準備
  const initialData = {
    name: festival.name,
    municipalityId: festival.municipality.id,
    address: festival.address,
    content: festival.content,
    foodStalls: festival.foodStalls || '',
    sponsors: festival.sponsors || '',
    isVisible: festival.isVisible,
    schedules: festival.schedules.map(schedule => ({
      date: schedule.date,
      startTime: schedule.startTime,
      endTime: schedule.endTime
    }))
  };

  return (
    <div className="festival-edit-page">
      <FestivalForm
        festivalId={festival.id}
        initialData={initialData}
        isEditMode={true}
      />
    </div>
  );
};

export default FestivalEditPage;
