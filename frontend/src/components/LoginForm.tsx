import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

type Mode = 'login' | 'register';

const LoginForm: React.FC = () => {
  const [mode, setMode] = useState<Mode>('login');
  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
    email: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  
  const { login, requestRegistration, isLoading, error } = useAuth();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (mode === 'login') {
      if (!formData.identifier.trim()) {
        newErrors.identifier = 'ユーザー名またはメールアドレスを入力してください';
      }
      if (!formData.password) {
        newErrors.password = 'パスワードを入力してください';
      } else if (formData.password.length < 6) {
        newErrors.password = 'パスワードは6文字以上で入力してください';
      }
    } else {
      if (!formData.email.trim()) {
        newErrors.email = 'メールアドレスを入力してください';
      } else if (!/\S+@\S+\.\S+/.test(formData.email.trim())) {
        newErrors.email = '有効なメールアドレスを入力してください';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      if (mode === 'login') {
        await login(formData.identifier.trim(), formData.password);
      } else {
        await requestRegistration(formData.email.trim());
        setRegistrationSuccess(true);
        setFormData(prev => ({
          ...prev,
          email: ''
        }));
      }
    } catch (submissionError) {
      // エラーは AuthContext 側で保持
      setRegistrationSuccess(false);
    }
  };

  const toggleMode = () => {
    setMode(prev => (prev === 'login' ? 'register' : 'login'));
    setFormData({
      identifier: '',
      password: '',
      email: ''
    });
    setErrors({});
    setRegistrationSuccess(false);
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <h2 className="login-title">
          {mode === 'login' ? 'ログイン' : '仮登録（メール送信）'}
        </h2>
        <p className="login-subtitle">
          {mode === 'login'
            ? 'ユーザー名またはメールアドレスとパスワードを入力してください'
            : '登録用の確認メールを受け取るメールアドレスを入力してください'}
        </p>

        <form onSubmit={handleSubmit}>
          {mode === 'login' ? (
            <>
              <div className="form-group">
                <input
                  id="identifier"
                  name="identifier"
                  type="text"
                  required
                  className={`form-input ${errors.identifier ? 'error' : ''}`}
                  placeholder="ユーザー名またはメールアドレス"
                  value={formData.identifier}
                  onChange={handleInputChange}
                />
                {errors.identifier && (
                  <p className="error-message">{errors.identifier}</p>
                )}
              </div>

              <div className="form-group">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className={`form-input ${errors.password ? 'error' : ''}`}
                  placeholder="パスワード"
                  value={formData.password}
                  onChange={handleInputChange}
                />
                {errors.password && (
                  <p className="error-message">{errors.password}</p>
                )}
              </div>
            </>
          ) : (
            <div className="form-group">
              <input
                id="email"
                name="email"
                type="email"
                required
                className={`form-input ${errors.email ? 'error' : ''}`}
                placeholder="メールアドレス"
                value={formData.email}
                onChange={handleInputChange}
              />
              {errors.email && (
                <p className="error-message">{errors.email}</p>
              )}
            </div>
          )}

          {error && (
            <div style={{ background: '#fef2f2', padding: '1rem', borderRadius: '0.375rem', marginBottom: '1rem' }}>
              <div style={{ color: '#dc2626', fontSize: '0.875rem' }}>{error}</div>
            </div>
          )}

          {registrationSuccess && (
            <div style={{ background: '#ecfdf5', padding: '1rem', borderRadius: '0.375rem', marginBottom: '1rem' }}>
              <div style={{ color: '#047857', fontSize: '0.875rem' }}>
                確認メールを送信しました。メールに記載のリンクから本登録を完了してください（有効期限：1週間）。
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="login-button"
          >
            {isLoading ? '処理中...' : (mode === 'login' ? 'ログイン' : 'メールを送信する')}
          </button>

          <button
            type="button"
            onClick={toggleMode}
            className="toggle-button"
          >
            {mode === 'login' ? '仮登録メールを送信する' : 'ログインに戻る'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
