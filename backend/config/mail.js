require('dotenv').config();

// === SMTP 接続情報 ===
// backend/.env に以下のように記載してください:
// MAIL_HOST=smtp.example.com
// MAIL_PORT=587
// MAIL_SECURE=false          # SSL/TLS を使用する場合は true
// MAIL_USER=your-smtp-user
// MAIL_PASS=your-smtp-password
// MAIL_FROM=no-reply@example.com
// MAIL_REPLY_TO=support@example.com   # 任意
// MAIL_SUBJECT_REGISTRATION=...       # 任意
// MAIL_BODY_REGISTRATION=...          # 任意（{{verificationUrl}} と {{expiresAt}} を含める）

const smtpHost = process.env.MAIL_HOST;
const smtpPort = Number(process.env.MAIL_PORT || 587);
const smtpSecure = (process.env.MAIL_SECURE || 'false').toLowerCase() === 'true';
const smtpUser = process.env.MAIL_USER;
const smtpPass = process.env.MAIL_PASSWORD || process.env.MAIL_PASS;

const defaultRegistrationSubject =
  process.env.MAIL_SUBJECT_REGISTRATION ||
  '【おまつり管理】メールアドレスの確認について';

const defaultRegistrationBody =
  process.env.MAIL_BODY_REGISTRATION ||
  [
    'このたびは会員登録のお申し込みありがとうございます。',
    '',
    '以下のURLにアクセスして、本登録を1週間以内に完了してください。',
    '{{verificationUrl}}',
    '',
    '※このメールに心当たりがない場合は破棄してください。',
    '※URLの有効期限：{{expiresAt}}',
    '',
    'おまつり管理チーム'
  ].join('\n');

const defaultEmailChangeSubject =
  process.env.MAIL_SUBJECT_EMAIL_CHANGE ||
  '【おまつり管理】新しいメールアドレスの確認';

const defaultEmailChangeBody =
  process.env.MAIL_BODY_EMAIL_CHANGE ||
  [
    'メールアドレス変更のご依頼を受け付けました。',
    '',
    '以下のURLにアクセスして、新しいメールアドレスの確認を1週間以内に完了してください。',
    '{{verificationUrl}}',
    '',
    '※このメールに心当たりがない場合は破棄してください。',
    '※URLの有効期限：{{expiresAt}}',
    '',
    'おまつり管理チーム'
  ].join('\n');

module.exports = {
  smtp: {
    host: smtpHost,
    port: smtpPort,
    secure: smtpSecure,
    auth:
      smtpUser && smtpPass
        ? {
            user: smtpUser,
            pass: smtpPass
          }
        : undefined
  },
  from: process.env.MAIL_FROM || 'no-reply@example.com',
  replyTo: process.env.MAIL_REPLY_TO || undefined,
  subjects: {
    registration: defaultRegistrationSubject,
    emailChange: defaultEmailChangeSubject
  },
  templates: {
    registration: defaultRegistrationBody,
    emailChange: defaultEmailChangeBody
  }
};

