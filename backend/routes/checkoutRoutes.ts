import { Router } from 'express';
import authMiddleware from '../middleware/authMiddleware';
import { processCheckout } from '../controller/checkoutController';

const router = Router();

router.post('/', authMiddleware, processCheckout);

export default router;