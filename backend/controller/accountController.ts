import { Request, Response } from "express";
import * as accountService from "../service/accountService";
import { parseChangePassword } from "../validators/accountValidator";
import { AppError } from "../utils/app-error";
import { AuthenticatedRequest } from "../types/auth";

export const changePassword = async (req: Request, res: Response) => {
    try {
        const userId = (req as AuthenticatedRequest).user!.userId;
        const { currentPassword, newPassword } = parseChangePassword(req.body);

        await accountService.changePassword(userId, currentPassword, newPassword);
        res.json({ success: true, message: "Password updated." });
    } catch (err) {
        if (err instanceof AppError) {
            return res.status(err.statusCode).json({ success: false, message: err.message });
        }
        console.error("Change password failed:", err); // never log the request body
        res.status(500).json({ success: false, message: "Something went wrong." });
    }
};
