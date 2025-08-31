const express = require('express');
const rateLimit = require('express-rate-limit');
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');

const router = express.Router();

// 登録用のレート制限（ログインは新しいシステムを使用）
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1時間
  max: 3, // 1時間に3回まで
  message: { error: '登録試行回数が上限に達しました。1時間後に再試行してください。' }
});

// 認証ルート
router.post('/register', registerLimiter, authController.registerValidation, authController.register);
router.post('/login', authController.loginValidation, authController.login);
router.get('/profile', auth, authController.getProfile);
router.post('/logout', auth, authController.logout);

module.exports = router;
