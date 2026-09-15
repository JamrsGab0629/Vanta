import { Router } from 'express';
<<<<<<< HEAD
import { getUserTransactions, getAllTransactions } from '../controller/transactionController';
import authMiddleware from '../middleware/authMiddleware';
=======
import { editTransactionsStatus, getTransactions, getUserTransactions } from '../controller/transactionController';
import authMiddleware from '../middleware/authMiddleware'; // Adjust path based on your folder structure
>>>>>>> f4428d7 (feat: add admin middleware import and structure for transaction routes)
import adminMiddleware from '../middleware/adminMiddleware';

const router = Router();

// GET /api/transactions - user's own transactions
router.get('/', authMiddleware, getUserTransactions);

<<<<<<< HEAD
// GET /api/transactions/admin/all - all transactions, admin only
router.get('/admin/all', authMiddleware, adminMiddleware, getAllTransactions);
=======
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
>>>>>>> f4428d7 (feat: add admin middleware import and structure for transaction routes)

export default router;