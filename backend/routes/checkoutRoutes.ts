import { Router } from 'express';
import authMiddleware from '../middleware/authMiddleware';
import { getShippingRates,processCheckout } from '../controller/checkoutController';

const router = Router();

router.post('/', authMiddleware, processCheckout);
   router.get("/shipping-rates", getShippingRates);
export default router;