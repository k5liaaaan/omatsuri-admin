import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const usernameRegex = /^[a-zA-Z0-9_]+$/;

const CompleteRegistration: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const navigate = useNavigate();
  const { completeRegistration, isLoading, error } = useAuth();

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    organizerName: ''
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [localError, setLocalError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (fieldErrors[name]) {
      setFieldErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.username.trim()) {
      newErrors.username = 'ユーザー名を入力してください';
    } else if (formData.username.length < 3 || formData.username.length > 20) {
      newErrors.username = 'ユーザー名は3文字以上20文字以内で入力してください';
    } else if (!usernameRegex.test(formData.username)) {
      newErrors.username = 'ユーザー名は英数字またはアンダースコアのみ使用できます';
    }

    if (!formData.password) {
      newErrors.password = 'パスワードを入力してください';
    } else if (formData.password.length < 6) {
      newErrors.password = 'パスワードは6文字以上で入力してください';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = '確認用パスワードを入力してください';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'パスワードが一致しません';
    }

    if (formData.organizerName && formData.organizerName.length > 191) {
      newErrors.organizerName = '主催団体名は191文字以内で入力してください';
    }

    setFieldErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!token) {
      setLocalError('トークンが無効です。メールのリンクを再度確認してください。');
      return;
    }

    if (!validate()) {
      return;
    }

    try {
      await completeRegistration({
        token,
        username: formData.username.trim(),
        password: formData.password,
        organizerName: formData.organizerName.trim() || undefined
      });

      navigate('/');
    } catch (submissionError) {
      // エラーは AuthContext 側で保持しているためここでは追加処理のみ
    }
  };

  if (!token) {
    return (
      <div className="login-container">
        <div className="login-form">
          <h2 className="login-title">本登録リンクが無効です</h2>
          <p className="login-subtitle">
            リンクの有効期限が切れているか、URLが正しくありません。再度仮登録からやり直してください。
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-form">
        <h2 className="login-title">本登録フォーム</h2>
        <p className="login-subtitle">
          メールアドレスの確認が完了しました。下記の情報を入力して本登録を完了してください。
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              id="username"
              name="username"
              type="text"
              required
              className={`form-input ${fieldErrors.username ? 'error' : ''}`}
              placeholder="ユーザー名（3〜20文字、英数字・アンダースコア）"
              value={formData.username}
              onChange={handleInputChange}
            />
            {fieldErrors.username && (
              <p className="error-message">{fieldErrors.username}</p>
            )}
          </div>

          <div className="form-group">
            <input
              id="password"
              name="password"
              type="password"
              required
              className={`form-input ${fieldErrors.password ? 'error' : ''}`}
              placeholder="パスワード（6文字以上）"
              value={formData.password}
              onChange={handleInputChange}
            />
            {fieldErrors.password && (
              <p className="error-message">{fieldErrors.password}</p>
            )}
          </div>

          <div className="form-group">
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              className={`form-input ${fieldErrors.confirmPassword ? 'error' : ''}`}
              placeholder="パスワード（確認用）"
              value={formData.confirmPassword}
              onChange={handleInputChange}
            />
            {fieldErrors.confirmPassword && (
              <p className="error-message">{fieldErrors.confirmPassword}</p>
            )}
          </div>

          <div className="form-group">
            <input
              id="organizerName"
              name="organizerName"
              type="text"
              className={`form-input ${fieldErrors.organizerName ? 'error' : ''}`}
              placeholder="お祭り主催団体名（任意）"
              value={formData.organizerName}
              onChange={handleInputChange}
            />
            {fieldErrors.organizerName && (
              <p className="error-message">{fieldErrors.organizerName}</p>
            )}
          </div>

          {localError && (
            <div style={{ background: '#fef2f2', padding: '1rem', borderRadius: '0.375rem', marginBottom: '1rem' }}>
              <div style={{ color: '#dc2626', fontSize: '0.875rem' }}>{localError}</div>
            </div>
          )}

          {error && (
            <div style={{ background: '#fef2f2', padding: '1rem', borderRadius: '0.375rem', marginBottom: '1rem' }}>
              <div style={{ color: '#dc2626', fontSize: '0.875rem' }}>{error}</div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="login-button"
          >
            {isLoading ? '登録処理中...' : '本登録を完了する'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CompleteRegistration;

