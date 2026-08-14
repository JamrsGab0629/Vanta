import { Router } from "express";
import { login} from "../controller/loginController";
import {register} from "../controller/registerController";
const router = Router();

router.post("/login", login);
router.post("/register", register);

export default router;