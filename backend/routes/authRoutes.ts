import { Router } from "express";
import { login } from "../controller/loginController";
import { register } from "../controller/registerController";
import { verifyOtp } from "../controller/verifyOtpController";
import { logout } from "../controller/logoutController";
import { verifyAuth, fetchUserData, fetchUserInfo } from "../controller/dataVerificationController";
import * as forgotPasswordController from "../controller/forgotPasswordController";
import authMiddleware from "../middleware/authMiddleware";
import { resendVerification } from "../controller/resendVerificationController";
import { rateLimiter } from "../middleware/rateLimiter";

const router = Router();

router.post("/login", rateLimiter(10, 15 * 60 * 1000), login);
router.post("/register", rateLimiter(5, 15 * 60 * 1000), register);
router.post("/verify-otp", rateLimiter(5, 15 * 60 * 1000), verifyOtp);
router.post("/resend-verification", rateLimiter(3, 15 * 60 * 1000), resendVerification);
router.post("/logout", authMiddleware, logout);

//this is for forgot password
router.post("/request-password-reset", rateLimiter(3, 15 * 60 * 1000), forgotPasswordController.requestPasswordReset)
router.post("/verify-password-reset-otp", rateLimiter(5, 15 * 60 * 1000), forgotPasswordController.verifyPasswordResetOtp)
router.post("/reset-password", rateLimiter(3, 15 * 60 * 1000), forgotPasswordController.resetPassword)

// this is for verification
router.post("/verify-auth", authMiddleware, verifyAuth);
router.post("/fetch-user-data", authMiddleware, fetchUserData);

router.post("/fetch-user-info", authMiddleware, fetchUserInfo);

export default router;
