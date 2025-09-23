const express = require('express');
const router = express.Router();
const { getFestivals, createFestival, getUserFestivals, getFestivalById, deleteFestival, unpublishFestival, updateFestival } = require('../controllers/festivalController');
const auth = require('../middleware/auth');

// お祭り一覧取得（認証必要）
router.get('/', auth, getFestivals);

// お祭り詳細取得（認証不要）
router.get('/:id', getFestivalById);

// お祭り登録（認証必要）
router.post('/', auth, createFestival);

// ユーザーが登録したお祭り一覧取得（認証必要）
router.get('/my', auth, getUserFestivals);

// お祭り削除（認証必要）
router.delete('/:id', auth, deleteFestival);

// お祭り非公開設定（認証必要）
router.patch('/:id/unpublish', auth, unpublishFestival);

// お祭り更新（認証必要）
router.put('/:id', auth, updateFestival);

module.exports = router;
