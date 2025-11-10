const nodemailer = require('nodemailer');
const mailConfig = require('../config/mail');

const transporter = nodemailer.createTransport({
  host: mailConfig.smtp.host,
  port: mailConfig.smtp.port,
  secure: mailConfig.smtp.secure,
  auth: mailConfig.smtp.auth
});

/**
 * プレーンテキストメール本文にテンプレートを適用
 * @param {string} template
 * @param {Record<string, string>} params
 * @returns {string}
 */
const renderTemplate = (template, params) => {
  return Object.entries(params).reduce((text, [key, value]) => {
    const pattern = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
    return text.replace(pattern, value);
  }, template);
};

const formatExpiresAt = (expiresAt) =>
  expiresAt.toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' });

/**
 * 認証メールを送信
 * @param {{ to: string, verificationUrl: string, expiresAt: Date }}
 */
const sendRegistrationEmail = async ({ to, verificationUrl, expiresAt }) => {
  const expiresAtText = expiresAt
    .toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' });

  const subject = mailConfig.subjects.registration;
  const text = renderTemplate(mailConfig.templates.registration, {
    verificationUrl,
    expiresAt: expiresAtText
  });

  const mailOptions = {
    from: mailConfig.from,
    to,
    subject,
    text
  };

  if (mailConfig.replyTo) {
    mailOptions.replyTo = mailConfig.replyTo;
  }

  await transporter.sendMail(mailOptions);
};

/**
 * メールアドレス変更確認メールを送信
 * @param {{ to: string, verificationUrl: string, expiresAt: Date }}
 */
const sendEmailChangeConfirmation = async ({ to, verificationUrl, expiresAt }) => {
  const expiresAtText = formatExpiresAt(expiresAt);

  const subject = mailConfig.subjects.emailChange;
  const text = renderTemplate(mailConfig.templates.emailChange, {
    verificationUrl,
    expiresAt: expiresAtText
  });

  const mailOptions = {
    from: mailConfig.from,
    to,
    subject,
    text
  };

  if (mailConfig.replyTo) {
    mailOptions.replyTo = mailConfig.replyTo;
  }

  await transporter.sendMail(mailOptions);
};

module.exports = {
  sendRegistrationEmail,
  sendEmailChangeConfirmation
};

