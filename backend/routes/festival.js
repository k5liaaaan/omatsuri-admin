const express = require('express');
const router = express.Router();
const { getFestivals, createFestival, getUserFestivals } = require('../controllers/festivalController');
const auth = require('../middleware/auth');

// お祭り一覧取得（認証不要）
router.get('/', getFestivals);

// お祭り登録（認証必要）
router.post('/', auth, createFestival);

// ユーザーが登録したお祭り一覧取得（認証必要）
router.get('/my', auth, getUserFestivals);

module.exports = router;
