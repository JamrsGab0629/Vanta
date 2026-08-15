import { Router } from "express";
import { login } from "../controller/loginController";
import { register } from "../controller/registerController";
import { verifyOtp } from "../controller/verifyOtpController";
import { logout } from "../controller/logoutController";
import authMiddleware from "../middleware/authMiddleware";

const router = Router();

router.post("/login", login);
router.post("/register", register);
router.post("/verify-otp", verifyOtp);
router.post("/logout", authMiddleware, logout); 

export default router;