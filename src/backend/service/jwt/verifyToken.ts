import jwt, { JwtPayload } from "jsonwebtoken";
import "dotenv/config";

const verifyToken = (token: string): JwtPayload | string => {
    return jwt.verify(
        token,
        process.env["JWT_SECRET"]!
    );
};

export { verifyToken };
