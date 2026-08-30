import { Request, Response, NextFunction } from "express";

export const rateLimiter = (limit: number, windowMs: number = 60000) => {
    const requests = new Map<string, { count: number; expiresAt: number }>();

    // Periodic cleanup of expired entries
    const cleanupInterval = setInterval(() => {
        const now = Date.now();
        for (const [key, record] of requests.entries()) {
            if (now > record.expiresAt) {
                requests.delete(key);
            }
        }
    }, windowMs);

    cleanupInterval.unref();

    return (req: Request, res: Response, next: NextFunction) => {
        const ip = req.ip || "unknown";
        const now = Date.now();
        const record = requests.get(ip);

        if (!record || now > record.expiresAt) {
            requests.set(ip, { count: 1, expiresAt: now + windowMs });
            return next();
        }

        if (record.count >= limit) {
            return res.status(429).json({ message: "Too many requests, please try again later." });
        }

        record.count++;
        next();
    };
};