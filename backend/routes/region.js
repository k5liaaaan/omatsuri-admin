const express = require('express');
const router = express.Router();
const regionController = require('../controllers/regionController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// 都道府県関連のルート
router.get('/prefectures', regionController.getPrefectures);
router.get('/prefectures/:id', regionController.getPrefectureById);
router.post('/prefectures', regionController.createPrefecture);

// 市区町村関連のルート
router.get('/municipalities', regionController.getMunicipalities);
router.get('/municipalities/:id', regionController.getMunicipalityById);
router.get('/prefectures/:prefectureId/municipalities', regionController.getMunicipalitiesByPrefecture);
router.post('/prefectures/:prefectureId/municipalities', regionController.createMunicipality);
router.put('/municipalities/:id', regionController.updateMunicipality);

// 市区町村リクエスト関連のルート
router.post('/municipality-requests', auth, regionController.createMunicipalityRequest);
router.get('/municipality-requests', auth, admin, regionController.getMunicipalityRequests);

module.exports = router;
