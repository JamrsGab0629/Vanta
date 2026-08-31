// routes/cartRoutes.ts
import { Router } from "express";
import { addToCart, getCart } from "../controller/cartController";
import authMiddleware from "../middleware/authMiddleware"; // ✅ Import the middleware, not the helper

const router = Router();

// Apply authentication middleware to all cart routes
router.use(authMiddleware); // ✅ Use the middleware

// GET /api/cart - View user's cart and items
router.get("/", getCart);

// POST /api/cart - Add item to cart (or increment quantity)
router.post("/", addToCart);

export default router;