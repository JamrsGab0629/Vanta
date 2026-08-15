import { Router } from "express";
import { login} from "../controller/loginController";
import {register} from "../controller/registerController";
import { verifyOtp } from "../controller/verifyOtpController";
const router = Router();

router.post("/login", login);
router.post("/register", register);
router.post("/verify-otp",verifyOtp);


export default router;