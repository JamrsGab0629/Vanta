import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import "dotenv/config";
import { AuthenticatedRequest } from "../../types/auth"; // Adjust path to your types file

export const verifyToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Access denied. No token provided." });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "Access denied. Invalid token format." });
    }

    try {
        const secret = process.env["JWT_SECRET"]!;
        const decoded = jwt.verify(token, secret);

        // Attach decoded payload to req.user
        req.user = decoded as any;
        next();
    } catch (error) {
        return res.status(403).json({ message: "Invalid or expired token." });
    }
};