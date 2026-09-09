// routes/cartRoutes.ts
import { Router } from "express";
import { addToCart, deleteToCart, getCart } from "../controller/cartController";
import authMiddleware from "../middleware/authMiddleware"; 

const router = Router();

// Apply authentication middleware to all cart routes
router.use(authMiddleware);

// GET /api/cart - View user's cart and items
router.get("/", getCart);

// POST /api/cart - Add item to cart (or modify quantity)
router.post("/", addToCart);

// DELETE /api/cart - Delete an item to cart 
router.delete("/:product_id", deleteToCart);

export default router;