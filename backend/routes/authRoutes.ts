import { Router } from "express";
import { login } from "../controller/loginController";
import { register } from "../controller/registerController";
import { verifyOtp } from "../controller/verifyOtpController";
import { logout } from "../controller/logoutController";
import { verifyAuth, fetchUserData } from "../controller/dataVerificationController";
import authMiddleware from "../middleware/authMiddleware";
import { resendVerification } from "../controller/resendVerificationController";
import { rateLimiter } from "../middleware/rateLimiter";

const router = Router();

router.post("/login", rateLimiter(10, 15 * 60 * 1000), login);
router.post("/register", rateLimiter(5, 15 * 60 * 1000), register);
router.post("/verify-otp", rateLimiter(5, 15 * 60 * 1000), verifyOtp);
router.post("/resend-verification", rateLimiter(3, 15 * 60 * 1000), resendVerification);
router.post("/logout", authMiddleware, logout);

// this is for verification
router.post("/verify-auth", authMiddleware, verifyAuth);
router.post("/fetch-user-data", authMiddleware, fetchUserData);

export default router;
