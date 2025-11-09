import express from 'express';
import { getProfile, loginUser, logoutAllUserSessions, logoutUser, registerUser } from '../controllers/auth.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', authenticate, logoutUser);
router.post('/logout-all', authenticate, logoutAllUserSessions);
router.get('/profile', authenticate, getProfile);

export default router;