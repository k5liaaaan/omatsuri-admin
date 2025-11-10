import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

type Status = 'idle' | 'loading' | 'success' | 'error';

const ConfirmEmailChange: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const { token: authToken, refreshProfile } = useAuth();
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    const confirm = async () => {
      if (!token) {
        setStatus('error');
        setMessage('トークンが無効です。メールのリンクを再度確認してください。');
        return;
      }

      setStatus('loading');
      try {
        const response = await axios.post('/api/auth/confirm-email-change', { token });
        setStatus('success');
        setMessage(response.data.message || 'メールアドレスを更新しました');
        if (authToken) {
          await refreshProfile();
        }
      } catch (error: any) {
        setStatus('error');
        setMessage(error.response?.data?.error || 'メールアドレスの更新に失敗しました。再度お試しください。');
      }
    };

    confirm();
  }, [token, authToken, refreshProfile]);

  return (
    <div className="profile-edit-container">
      <div className="profile-edit-card">
        <div className="profile-edit-header">
          <h1>メールアドレス確認</h1>
          <p>メールに記載されたリンクからアクセスしています。</p>
        </div>

        {status === 'loading' && (
          <div className="profile-alert info">
            <p>確認処理を実行中です...</p>
          </div>
        )}

        {(status === 'success' || status === 'error') && (
          <div className={`profile-alert ${status === 'success' ? 'success' : 'warning'}`}>
            <p>{message}</p>
          </div>
        )}

        <div className="profile-edit-actions">
          <button
            type="button"
            className="primary-button"
            onClick={() => navigate(authToken ? '/' : '/')}
          >
            {authToken ? 'ダッシュボードへ戻る' : 'トップページへ'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmEmailChange;

