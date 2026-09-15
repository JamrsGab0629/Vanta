import { Router } from 'express';
import { getUserTransactions, getAllTransactions, updateOrderStatus } from '../controller/transactionController';
import authMiddleware from '../middleware/authMiddleware';
import adminMiddleware from '../middleware/adminMiddleware';

const router = Router();

router.get('/', authMiddleware, getUserTransactions);
router.get('/admin/all', authMiddleware, adminMiddleware, getAllTransactions);
router.patch('/admin/:orderId/status', authMiddleware, adminMiddleware, updateOrderStatus);

export default router;