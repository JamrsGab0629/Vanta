import { Router } from 'express';
import { getUserTransactions, getAllTransactions } from '../controller/transactionController';
import authMiddleware from '../middleware/authMiddleware';
import adminMiddleware from '../middleware/adminMiddleware';

const router = Router();

// GET /api/transactions - user's own transactions
router.get('/', authMiddleware, getUserTransactions);

// GET /api/transactions/admin/all - all transactions, admin only
router.get('/admin/all', authMiddleware, adminMiddleware, getAllTransactions);

export default router;