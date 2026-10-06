import { Router } from "express";
import * as userController from "../controller/user.controller";

const router = Router();

// Auth + admin checks are applied where this router is mounted (see app.ts).
router.get("/", userController.getUsers);              // ?search=&role=ADMIN|USER
router.patch("/:id/promote", userController.promote);
router.patch("/:id/demote", userController.demote);
router.delete("/:id", userController.remove);

export default router;
