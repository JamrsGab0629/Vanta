import jwt from "jsonwebtoken";
import "dotenv/config";

export const verifyToken = (token: string) => {
    const secret = process.env["JWT_SECRET"];
    if (!secret) {
        throw new Error("JWT_SECRET is not defined in environment variables");
    }
    // Returns the decoded payload or throws an error if invalid/expired
    return jwt.verify(token, secret);
};