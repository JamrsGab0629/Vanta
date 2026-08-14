import jwt from "jsonwebtoken";
import "dotenv/config";

const verifyToken = (token: string) => {
    return jwt.verify(
        token,
        process.env["JWT_SECRET"]!
    );
};

export { verifyToken };