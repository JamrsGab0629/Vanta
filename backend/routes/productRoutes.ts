import { Router } from "express";
import authMiddleware from "../middleware/authMiddleware";
import adminMiddleware from "../middleware/adminMiddleware";
import { uploadProductImage } from "../middleware/uploadMiddleware";
import {
    createProduct,
    updateProduct,
    deleteProduct,
    uploadImage,
    getProducts,
    getProductById,
    getProductBySku,
} from "../controller/productController";

const router = Router();

// ==========================================
// Public Endpoints (Browsing & Discovery)
// ==========================================
router.get("/", getProducts);
router.get("/sku/:sku", getProductBySku);
router.get("/:id", getProductById);

// ==========================================
// Admin-Only Endpoints (Item Management)
// ==========================================
router.post("/upload-image", authMiddleware, adminMiddleware, uploadProductImage.single("image"), uploadImage);
router.post("/", authMiddleware, adminMiddleware, uploadProductImage.single("image"), createProduct);
router.put("/:id", authMiddleware, adminMiddleware, uploadProductImage.single("image"), updateProduct);
router.delete("/:id", authMiddleware, adminMiddleware, deleteProduct);

export default router;

