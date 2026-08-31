import jwt from "jsonwebtoken";
import crypto from "crypto";
import "dotenv/config";

const generateToken = (userId: number, role: string) => {
    const jti = crypto.randomUUID(); // Unique ID for this specific login session

    return jwt.sign(
        { userId, role, jti },
        process.env["JWT_SECRET"]!,
        { expiresIn: "7d" }
    );
};

export { generateToken };
