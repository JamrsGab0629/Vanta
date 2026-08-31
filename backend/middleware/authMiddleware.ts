import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../service/jwt/verifyToken";
import TokenBlacklist from "../model/tokenBlacklistModel";
import User from "../model/userModel";
import { AuthenticatedRequest } from "../types/auth";

const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies?.['token'];

    if (!token) {
        return res.status(401).json({ message: "Not authenticated" });
    }

    try {
        // 1. Verify signature and expiration using the helper
        const decoded = verifyToken(token) as any;
        
        if (
            typeof decoded === "string" || 
            typeof decoded['userId'] !== "number" || 
            typeof decoded.jti !== "string" || 
            typeof decoded.exp !== "number"
        ) {
            return res.status(401).json({ message: "Invalid token structure" });
        }

        // 2. Check if this specific session ID (jti) was revoked
        const blacklisted = await TokenBlacklist.findOne({ where: { jti: decoded.jti } });
        if (blacklisted) {
            return res.status(401).json({ message: "Token has been revoked. Please log in again." });
        }

        // 3. Verify user exists and is active
        const user = await User.findByPk(decoded['userId']);
        if (!user || !user.get("is_verified")) {
            return res.status(401).json({ message: "Account is no longer authorized" });
        }

        // 4. Attach user payload to request
        (req as AuthenticatedRequest).user = {
            userId: decoded['userId'],
            role: user.get("role") as string,
            jti: decoded.jti,
            exp: decoded.exp,
        };
        
        next();
    } catch (error: any) {
        console.error("AUTH MIDDLEWARE ERROR:", error.message);
        return res.status(401).json({ message: "Invalid token" });
    }
};

export default authMiddleware;