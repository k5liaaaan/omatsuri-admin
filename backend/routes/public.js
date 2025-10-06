const express = require('express');
const router = express.Router();
const { getPublicFestivals, getPublicFestivalById } = require('../controllers/publicFestivalController');

// 公開用 お祭り一覧
router.get('/festivals', getPublicFestivals);

// 公開用 お祭り詳細
router.get('/festivals/:id', getPublicFestivalById);

module.exports = router;


