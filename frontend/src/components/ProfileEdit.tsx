import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface FormErrors {
  email?: string;
  organizerName?: string;
  newPassword?: string;
  confirmPassword?: string;
  currentPassword?: string;
  general?: string;
}

const ProfileEdit: React.FC = () => {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const [newEmail, setNewEmail] = useState('');
  const [organizerName, setOrganizerName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const currentOrganizerName = user?.organizerName ?? '';
  const currentEmail = user?.email ?? '';
  const pendingEmail = user?.pendingEmailChange ?? null;

  useEffect(() => {
    if (user) {
      setOrganizerName(user.organizerName ?? '');
    }
  }, [user]);

  const emailChanged = useMemo(() => {
    if (!newEmail.trim()) {
      return false;
    }
    return newEmail.trim().toLowerCase() !== currentEmail.toLowerCase();
  }, [newEmail, currentEmail]);

  const organizerNameChanged = useMemo(() => {
    return organizerName.trim() !== currentOrganizerName.trim();
  }, [organizerName, currentOrganizerName]);

  const passwordChanged = useMemo(() => newPassword.length > 0, [newPassword]);

  const validate = () => {
    const newErrors: FormErrors = {};

    if (!currentPassword) {
      newErrors.currentPassword = '現在のパスワードを入力してください';
    }

    if (!emailChanged && !organizerNameChanged && !passwordChanged) {
      newErrors.general = '変更内容を入力してください（メールアドレス・主催団体名・パスワードのいずれか）';
    }

    if (newEmail && !/^\S+@\S+\.\S+$/.test(newEmail.trim())) {
      newErrors.email = '有効なメールアドレスを入力してください';
    }

    if (newPassword && newPassword.length < 6) {
      newErrors.newPassword = '新しいパスワードは6文字以上で入力してください';
    }

    if (newPassword && newPassword !== confirmPassword) {
      newErrors.confirmPassword = '新しいパスワードが一致しません';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSuccessMessage(null);
    if (!validate()) {
      return;
    }

    const payload: Record<string, string> = {
      currentPassword
    };

    if (emailChanged) {
      payload.email = newEmail.trim();
    }

    if (organizerNameChanged) {
      payload.organizerName = organizerName.trim();
    }

    if (passwordChanged) {
      payload.newPassword = newPassword;
      payload.confirmPassword = confirmPassword;
    }

    setIsSubmitting(true);
    try {
      const response = await axios.patch('/api/user/profile', payload);
      const { message, emailChangeRequested } = response.data;
      setSuccessMessage(
        emailChangeRequested
          ? `${message}。新しいメールアドレス宛に確認メールを送信しました。`
          : message
      );

      await refreshProfile();
      setNewEmail('');
      setNewPassword('');
      setConfirmPassword('');
      setCurrentPassword('');
      setErrors({});
    } catch (error: any) {
      if (error.response?.data?.errors) {
        const apiErrors: FormErrors = {};
        error.response.data.errors.forEach((err: { param: string; msg: string }) => {
          apiErrors[err.param as keyof FormErrors] = err.msg;
        });
        setErrors(apiErrors);
      } else {
        setErrors({
          general: error.response?.data?.error || 'プロフィールの更新に失敗しました'
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="profile-edit-container">
      <div className="profile-edit-card">
        <div className="profile-edit-header">
          <h1>プロフィール編集</h1>
          <p>メールアドレス・主催団体名・パスワードの変更が行えます。</p>
        </div>

        {pendingEmail && (
          <div className="profile-alert info">
            <p>
              新しいメールアドレス <strong>{pendingEmail.email}</strong> の確認待ちです。
            </p>
            <p>
              有効期限: {new Date(pendingEmail.expiresAt).toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })}
            </p>
            <p>メール内のリンクをクリックすると反映されます。</p>
          </div>
        )}

        {successMessage && (
          <div className="profile-alert success">
            <p>{successMessage}</p>
          </div>
        )}

        {errors.general && (
          <div className="profile-alert warning">
            <p>{errors.general}</p>
          </div>
        )}

        <form className="profile-edit-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">新しいメールアドレス</label>
            <input
              id="email"
              type="email"
              placeholder={currentEmail}
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className={errors.email ? 'error' : ''}
            />
            {errors.email && <p className="error-message">{errors.email}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="organizerName">主催団体名</label>
            <input
              id="organizerName"
              type="text"
              value={organizerName}
              onChange={(e) => setOrganizerName(e.target.value)}
              maxLength={191}
              className={errors.organizerName ? 'error' : ''}
            />
            {errors.organizerName && <p className="error-message">{errors.organizerName}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="newPassword">新しいパスワード</label>
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={errors.newPassword ? 'error' : ''}
              placeholder="変更しない場合は空欄"
            />
            {errors.newPassword && <p className="error-message">{errors.newPassword}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">新しいパスワード（確認）</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={errors.confirmPassword ? 'error' : ''}
              placeholder="変更しない場合は空欄"
            />
            {errors.confirmPassword && <p className="error-message">{errors.confirmPassword}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="currentPassword">現在のパスワード<span className="required">*</span></label>
            <input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className={errors.currentPassword ? 'error' : ''}
              required
            />
            {errors.currentPassword && <p className="error-message">{errors.currentPassword}</p>}
          </div>

          <div className="profile-edit-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={() => navigate(-1)}
              disabled={isSubmitting}
            >
              戻る
            </button>
            <button
              type="submit"
              className="primary-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? '更新中...' : '変更内容を保存'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileEdit;

