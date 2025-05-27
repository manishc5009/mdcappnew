import express from 'express';
import AuthController from '../controllers/authController.js';

const router = express.Router();
const authController = new AuthController();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/token', authController.refreshToken);

// Example route
router.get('/test', (req, res) => {
  res.json({ message: 'Auth route works!' });
});

export default router;
