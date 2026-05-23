const express = require('express');
const { registerUser, loginUser, logoutUser, getMe } = require('../controllers/authController.js');
const { protect } = require('../middleware/auth.js');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.get('/me', protect, getMe);

module.exports = router;