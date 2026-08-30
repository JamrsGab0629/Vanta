// routes/cartRoutes.ts
import { Router } from "express";
import { addToCart, getCart } from "../controller/cartController";
import { verifyToken } from "../service/jwt/verifyToken"; // Adjust path to your auth middleware

const router = Router();

// Apply authentication middleware to all cart routes
router.use(verifyToken);

// GET /api/cart - View user's cart and items
router.get("/", getCart);

// POST /api/cart - Add item to cart (or increment quantity)
router.post("/", addToCart);

export default router;