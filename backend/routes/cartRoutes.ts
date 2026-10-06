// routes/cartRoutes.ts
import { Router } from "express";
import { addToCart, deleteToCart, getCart, updateCartItem } from "../controller/cartController";
import authMiddleware from "../middleware/authMiddleware"; 

const router = Router();

// Apply authentication middleware to all cart routes
router.use(authMiddleware);

// GET /api/cart - View user's cart and items
router.get("/", getCart);

// POST /api/cart - Add item to cart
router.post("/", addToCart);

// PATCH /api/cart/:product_id - Set the exact quantity of an item already in the cart
router.patch("/:product_id", updateCartItem);

// DELETE /api/cart/:product_id - Delete an item from cart 
router.delete("/:product_id", deleteToCart);

export default router;