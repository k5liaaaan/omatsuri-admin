const express = require('express');
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');

const router = express.Router();

router.patch(
  '/profile',
  auth,
  userController.profileUpdateValidation,
  userController.updateProfile
);

module.exports = router;

