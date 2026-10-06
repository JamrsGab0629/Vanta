import { Router } from "express";
import * as accountController from "../controller/accountController";

const router = Router();

// authMiddleware is applied where this router is mounted (see app.ts).
router.patch("/password", accountController.changePassword);

export default router;
