import jwt from "jsonwebtoken";
import crypto from "crypto";
import "dotenv/config";

const generateToken = (userId: number) => {
    const jti = crypto.randomUUID(); // Unique ID for this specific login session

    return jwt.sign(
        { userId, jti },
        process.env["JWT_SECRET"]!,
        { expiresIn: "7d" }
    );
};

export { generateToken };