import { Request, Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../types/auth";

const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const user = (req as AuthenticatedRequest).user;

    if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Forbidden: Admin access required" });
    }

    next();
};

export default adminMiddleware;
