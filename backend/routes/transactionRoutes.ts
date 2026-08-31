import { Router } from 'express';
import { getUserTransactions } from '../controller/transactionController';
import authMiddleware from '../middleware/authMiddleware'; // Adjust path based on your folder structure

const router = Router();

// GET /api/transactions - Protected by your custom authMiddleware
router.get('/', authMiddleware, getUserTransactions);

export default router;