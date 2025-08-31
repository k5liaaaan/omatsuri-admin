import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const LoginForm: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  
  const { login, register, isLoading, error } = useAuth();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // エラーをクリア
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.username.trim()) {
      newErrors.username = 'ユーザー名を入力してください';
    } else if (formData.username.length < 3) {
      newErrors.username = 'ユーザー名は3文字以上で入力してください';
    }

    if (!isLogin) {
      if (!formData.email.trim()) {
        newErrors.email = 'メールアドレスを入力してください';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = '有効なメールアドレスを入力してください';
      }
    }

    if (!formData.password) {
      newErrors.password = 'パスワードを入力してください';
    } else if (formData.password.length < 6) {
      newErrors.password = 'パスワードは6文字以上で入力してください';
    }

    if (!isLogin && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'パスワードが一致しません';
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
      if (isLogin) {
        await login(formData.username, formData.password);
      } else {
        await register(formData.username, formData.email, formData.password);
      }
    } catch (error) {
      // エラーはAuthContextで処理される
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({
      username: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
    setErrors({});
  };

  return (
    <div className="login-container">
      <div className="login-form">
                 <h2 className="login-title">
           {isLogin ? 'ログイン' : 'アカウント作成'}
         </h2>
         <p className="login-subtitle">
           {isLogin ? 'アカウント情報を入力してください' : '新しいアカウントを作成してください'}
         </p>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              id="username"
              name="username"
              type="text"
              required
              className={`form-input ${errors.username ? 'error' : ''}`}
              placeholder="ユーザー名"
              value={formData.username}
              onChange={handleInputChange}
            />
            {errors.username && (
              <p className="error-message">{errors.username}</p>
            )}
          </div>
          
          {!isLogin && (
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
          
          {!isLogin && (
            <div className="form-group">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                placeholder="パスワード確認"
                value={formData.confirmPassword}
                onChange={handleInputChange}
              />
              {errors.confirmPassword && (
                <p className="error-message">{errors.confirmPassword}</p>
              )}
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
            {isLoading ? '処理中...' : (isLogin ? 'ログイン' : '登録')}
          </button>

                     <button
             type="button"
             onClick={toggleMode}
             className="toggle-button"
           >
             {isLogin ? 'アカウントを作成する' : 'ログインに戻る'}
           </button>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
