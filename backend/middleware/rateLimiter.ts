import { Request, Response, NextFunction } from "express";

const requests = new Map<string, { count: number; expiresAt: number }>();

const rateLimiter = (limit: number, windowMs: number = 60000) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const ip = req.ip || "unknown";
        const now = Date.now();
        const record = requests.get(ip);

       
        if (!record || now > record.expiresAt) {
            requests.set(ip, { count: 1, expiresAt: now + windowMs });
            return next();
        }

        if (record.count >= limit) {
            return res.status(429).json({ message: "Too many requests" });
        }

        record.count++;
        next();
    };
};

export 
{
    rateLimiter
}