import express from 'express';

import { verifyToken } from '../middleware/verifyToken.js';
import { deleteNotifications, getNotifications } from '../controllers/notification.controller.js';

const router = express.Router();

router.get('/all', verifyToken, getNotifications);
router.delete('/delete', verifyToken, deleteNotifications);

export default router;
