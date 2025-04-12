import express from 'express';
import authRoutes from './auth.js';
import adsRoutes from './ads.js';
import messagesRoutes from './messages.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/ads', adsRoutes);
router.use('/messages', auth, messagesRoutes);

export default router;