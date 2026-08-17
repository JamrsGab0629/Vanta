import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../service/jwt/verifyToken";
import TokenBlacklist from "../model/tokenBlacklistModel";

const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies?.['token'];

    if (!token) {
        return res.status(401).json({ message: "Not authenticated" });
    }

    try {
        // Verify signature and expiration first
        const decoded: any = verifyToken(token);

        // Check if this specific session ID (jti) was revoked
        const blacklisted = await TokenBlacklist.findOne({ where: { jti: decoded.jti } });
        if (blacklisted) {
            return res.status(401).json({ message: "Token has been revoked. Please log in again." });
        }

        (req as any).user = decoded;
        next();
    } catch {
        return res.status(401).json({ message: "Invalid token" });
    }
};

export default authMiddleware;