const express = require('express');
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

const router = express.Router();

router.patch(
  '/profile',
  auth,
  userController.profileUpdateValidation,
  userController.updateProfile
);

// 管理者専用エンドポイント
router.get(
  '/accounts',
  auth,
  admin,
  userController.getUsers
);

router.delete(
  '/accounts/:id',
  auth,
  admin,
  userController.deleteUser
);

module.exports = router;

