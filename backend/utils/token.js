const crypto = require('crypto');

/**
 * 認証用のワンタイムトークンを生成する
 * 32バイトのランダム値を URL セーフな文字列に変換
 */
const generateRegistrationToken = () => {
  return crypto.randomBytes(32).toString('base64url');
};

module.exports = {
  generateRegistrationToken
};

