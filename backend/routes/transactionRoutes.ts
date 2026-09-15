import { Router } from 'express';
import { editTransactionsStatus, getTransactions, getUserTransactions } from '../controller/transactionController';
import authMiddleware from '../middleware/authMiddleware'; // Adjust path based on your folder structure
import adminMiddleware from '../middleware/adminMiddleware';

const router = Router();

// GET /api/transactions - user's own transactions
router.get('/', authMiddleware, getUserTransactions);

// ADMIN routes

// GET /api/transactions/transactions - Protected by your custom authMiddleware
router.get('/transactions',
    authMiddleware,
    // adminMiddleware,
    getTransactions
);

// GET /api/transactions/transactions - Protected by your custom authMiddleware
router.put('/update-transaction',
    authMiddleware,
    // adminMiddleware,
    editTransactionsStatus
)

export default router;