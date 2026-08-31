import { Router } from "express";
import authMiddleware from "../middleware/authMiddleware";
import adminMiddleware from "../middleware/adminMiddleware";
import { AuthenticatedRequest } from "../types/auth";

const router = Router();


router.get("/dashboard", authMiddleware, (req, res) => {
    res.json({ message: "Welcome to your dashboard!", user: (req as AuthenticatedRequest).user });
});


router.get("/admin-panel", authMiddleware, adminMiddleware, (req, res) => {
    res.json({ message: "Welcome, Admin! Top-secret data here." });
});

export default router;
