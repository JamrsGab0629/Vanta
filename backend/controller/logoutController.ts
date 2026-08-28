import { Request, Response } from "express";
import { clearTokenCookie } from "../utils/cookieUtils";
import TokenBlacklist from "../model/tokenBlacklistModel";
import { AuthenticatedRequest } from "../types/auth";

const logout = async (req: Request, res: Response) => {
    try {
        const user = (req as AuthenticatedRequest).user;
        if (user) {
            await TokenBlacklist.findOrCreate({
                where: { jti: user.jti },
                defaults: { expires_at: new Date(user.exp * 1000) },
            });
        }

        // Wipe the browser cookie
        clearTokenCookie(res);

        return res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
        console.error("LOGOUT ERROR:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

export { logout };
