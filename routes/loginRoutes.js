// eslint-disable-next-line @typescript-eslint/no-require-imports
const express = require('express');
const router = express.Router();
// eslint-disable-next-line @typescript-eslint/no-require-imports
const LoginController = require('../controllers/loginController');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const authMiddleware = require('../middleware/authMiddleware');

// Login route (no authMiddleware needed)
router.post('/login', LoginController.login);
router.get('/loginc', LoginController.getAllLogins);

// Protected route (authMiddleware needed)
router.get('/logins', authMiddleware, LoginController.getAllLogins);

module.exports = router;