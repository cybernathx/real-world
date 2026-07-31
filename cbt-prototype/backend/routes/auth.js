const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { registerUser, loginUser, getCurrentUser, logoutUser } = require('../controllers/authController');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', verifyToken, logoutUser);
router.get('/me', verifyToken, getCurrentUser);

module.exports = router;
